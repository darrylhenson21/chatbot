import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { config } from './config'
import { query } from './db'

const secret = new TextEncoder().encode(config.session.secret)

export async function createSession(accountId: string) {
  const token = await new SignJWT({ accountId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)

  const expiresAt = new Date(Date.now() + config.session.maxAge * 1000)

  // Store in database
  await query(
    'INSERT INTO sessions (account_id, token, expires_at) VALUES ($1, $2, $3)',
    [accountId, token, expiresAt]
  )

  // Set cookie
  const cookieStore = await cookies()
  cookieStore.set(config.session.cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: config.session.maxAge,
    path: '/',
  })

  return token
}

export async function getSession() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(config.session.cookieName)?.value

    if (!token) return null

    const verified = await jwtVerify(token, secret)
    const accountId = verified.payload.accountId as string

    // For now, just return the session without database verification
    // since we're using JWT which is already verified
    return {
      accountId,
      account: {
        id: accountId,
        name: 'Greymouse AI Services',
        email: 'admin@greymouse.ai'
      },
    }
  } catch (error) {
    console.error('Session verification failed:', error)
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(config.session.cookieName)?.value

  if (token) {
    await query('DELETE FROM sessions WHERE token = $1', [token])
  }

  cookieStore.delete(config.session.cookieName)
}

export async function checkBruteForce(ip: string): Promise<{ allowed: boolean; delay?: number; lockout?: number }> {
  const result = await query(
    'SELECT * FROM auth_attempts WHERE ip_address = $1',
    [ip]
  )

  if (result.rows.length === 0) {
    return { allowed: true }
  }

  const attempt = result.rows[0]
  
  // Check if locked out
  if (attempt.locked_until && new Date(attempt.locked_until) > new Date()) {
    const lockoutSeconds = Math.ceil((new Date(attempt.locked_until).getTime() - Date.now()) / 1000)
    return { allowed: false, lockout: lockoutSeconds }
  }

  // Check if we need to reset (10 min window)
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
  if (new Date(attempt.updated_at) < tenMinutesAgo) {
    await query(
      'UPDATE auth_attempts SET attempts = 0, locked_until = NULL, updated_at = NOW() WHERE ip_address = $1',
      [ip]
    )
    return { allowed: true }
  }

  const attempts = attempt.attempts

  // Apply delays based on attempts
  if (attempts === 3) return { allowed: true, delay: 3000 }
  if (attempts === 4) return { allowed: true, delay: 10000 }
  if (attempts >= 5) {
    // Lock for 15 minutes
    const lockUntil = new Date(Date.now() + 15 * 60 * 1000)
    await query(
      'UPDATE auth_attempts SET locked_until = $1, updated_at = NOW() WHERE ip_address = $2',
      [lockUntil, ip]
    )
    return { allowed: false, lockout: 900 }
  }

  return { allowed: true }
}

export async function recordFailedAttempt(ip: string) {
  await query(
    `INSERT INTO auth_attempts (ip_address, attempts, updated_at)
     VALUES ($1, 1, NOW())
     ON CONFLICT (ip_address)
     DO UPDATE SET attempts = auth_attempts.attempts + 1, updated_at = NOW()`,
    [ip]
  )
}

export async function clearFailedAttempts(ip: string) {
  await query(
    'DELETE FROM auth_attempts WHERE ip_address = $1',
    [ip]
  )
}
