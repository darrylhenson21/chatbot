import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'
import { createSession, checkBruteForce, recordFailedAttempt, clearFailedAttempts } from '@/lib/auth'
import { getClientIp } from '@/lib/utils'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    const ip = getClientIp(request)

    // Random delay (200-600ms) for timing attack protection
    const randomDelay = Math.floor(Math.random() * 400) + 200
    await new Promise(resolve => setTimeout(resolve, randomDelay))

    // Check code
    if (code !== config.app.accessCode) {
      return NextResponse.json(
        { error: `Access code incorrect. Please try again.` },
        { status: 401 }
      )
    }

    // Try database operations, but continue if they fail (DB not initialized yet)
    try {
      // Check brute force
      const bruteCheck = await checkBruteForce(ip)
      
      if (!bruteCheck.allowed) {
        return NextResponse.json(
          { error: `Locked for ${bruteCheck.lockout} seconds. Please wait.` },
          { status: 429 }
        )
      }

      // Clear failed attempts on success
      await clearFailedAttempts(ip)

      // Get default account
      const accountResult = await query(
        'SELECT * FROM accounts LIMIT 1'
      )

      const accountId = accountResult.rows[0]?.id || 'temp-account-id'
      
      // Create session
      await createSession(accountId)
    } catch (dbError) {
      console.log('Database not initialized, using fallback authentication')
      // Create a temporary session without database
      const { SignJWT } = await import('jose')
      const secret = new TextEncoder().encode(config.session.secret)
      
      const token = await new SignJWT({ accountId: 'temp-account-id' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secret)

      const response = NextResponse.json({ success: true })
      response.cookies.set(config.session.cookieName, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: config.session.maxAge,
        path: '/',
      })
      
      return response
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unlock error:', error)
    return NextResponse.json(
      { error: 'Connection error. Please try again.' },
      { status: 500 }
    )
  }
}
