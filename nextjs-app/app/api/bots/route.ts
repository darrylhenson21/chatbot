import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'
import { config } from '@/lib/config'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const result = await query(
        `SELECT b.*, 
          (SELECT COUNT(*) FROM domains d WHERE d.bot_id = b.id AND d.is_active = true) as domain_count,
          (SELECT COUNT(*) FROM sources s WHERE s.bot_id = b.id AND s.status = 'completed') as source_count
         FROM bots b 
         WHERE b.account_id = $1 
         ORDER BY b.created_at DESC`,
        [session.accountId]
      )

      return NextResponse.json(result.rows)
    } catch (dbError) {
      console.log('Database not initialized, returning empty bots array')
      // Return empty array if database not initialized
      return NextResponse.json([])
    }
  } catch (error) {
    console.error('Get bots error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name } = await request.json()

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Bot name is required' }, { status: 400 })
    }

    try {
      // Check bot limit
      const countResult = await query(
        'SELECT COUNT(*) as count FROM bots WHERE account_id = $1',
        [session.accountId]
      )

      const botCount = parseInt(countResult.rows[0].count)
      if (botCount >= config.limits.botLimit) {
        return NextResponse.json(
          { error: `Bot limit reached. Maximum ${config.limits.botLimit} bots allowed.` },
          { status: 400 }
        )
      }

      const result = await query(
        `INSERT INTO bots (account_id, name) 
         VALUES ($1, $2) 
         RETURNING *`,
        [session.accountId, name.trim()]
      )

      const bot = result.rows[0]

      // Create bot_limits entry
      await query(
        'INSERT INTO bot_limits (bot_id) VALUES ($1)',
        [bot.id]
      )

      return NextResponse.json(bot, { status: 201 })
    } catch (dbError) {
      console.log('Database not initialized')
      return NextResponse.json(
        { error: 'Database not initialized. Please run the schema.sql file in Supabase first.' },
        { status: 503 }
      )
    }
  } catch (error) {
    console.error('Create bot error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
