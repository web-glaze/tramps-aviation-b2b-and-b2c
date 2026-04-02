import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth_token')?.value

  // ── Public pages — no auth needed ────────────────────────────────────
  const publicRoutes = [
    '/',
    '/b2b/login', '/b2b/register', '/b2b/kyc', '/b2b/forgot-password', '/b2b/reset-password',
    '/b2c/login', '/b2c/register',
    '/b2c/flights', '/b2c/hotels', '/b2c/insurance',
  ]

  if (publicRoutes.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next()
  }

  // ── Static / Next internals — skip ───────────────────────────────────
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // ── B2B agent dashboard — must be logged in ───────────────────────────
  if (pathname.startsWith('/b2b')) {
    if (!token) {
      const url = new URL('/b2b/login', request.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // ── B2C protected pages ───────────────────────────────────────────────
  const b2cProtected = ['/b2c/my-trips', '/b2c/booking', '/b2c/profile']
  if (b2cProtected.some((r) => pathname.startsWith(r)) && !token) {
    const url = new URL('/b2c/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
