import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await query(
      'SELECT * FROM bots WHERE id = $1 AND account_id = $2',
      [params.id, session.accountId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Get bot error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Build update query dynamically
    const allowedFields = [
      'name', 'greeting', 'system_prompt', 'temperature', 'top_p', 'max_tokens',
      'primary_color', 'text_color', 'background_color', 'status',
      'lead_fields', 'require_email', 'instant_lead_email', 'lead_email_recipients',
      'daily_digest_enabled', 'daily_digest_time', 'webhook_url', 'webhook_secret', 'webhook_events'
    ]

    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1

    Object.keys(body).forEach(key => {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = $${paramCount}`)
        values.push(body[key])
        paramCount++
      }
    })

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    updates.push('updated_at = NOW()')
    values.push(params.id, session.accountId)

    const result = await query(
      `UPDATE bots SET ${updates.join(', ')} 
       WHERE id = $${paramCount} AND account_id = $${paramCount + 1}
       RETURNING *`,
      values
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Bot not found' }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error('Update bot error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await query(
      'DELETE FROM bots WHERE id = $1 AND account_id = $2',
      [params.id, session.accountId]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete bot error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
