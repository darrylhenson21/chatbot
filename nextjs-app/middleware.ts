import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { config } from './lib/config'

const publicPaths = ['/unlock', '/embed.js', '/api/auth/unlock', '/api/health', '/api/chat', '/api/leads', '/api/cron/digest']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check for session cookie
  const token = request.cookies.get(config.session.cookieName)?.value

  if (!token) {
    // Redirect to unlock page
    return NextResponse.redirect(new URL('/unlock', request.url))
  }

  try {
    // Verify JWT
    const secret = new TextEncoder().encode(config.session.secret)
    await jwtVerify(token, secret)
    
    return NextResponse.next()
  } catch (error) {
    // Invalid token - redirect to unlock
    return NextResponse.redirect(new URL('/unlock', request.url))
  }
}

export const config_middleware = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
