import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth_token')?.value

  // ── Redirect /b2c/* search/booking pages → common pages (keep query params) ─
  // Common pages handle B2B vs B2C detection at booking time via role
  const b2cToCommon: Record<string, string> = {
    '/b2c/flights':     '/flights',
    '/b2c/hotels':      '/hotels',
    '/b2c/insurance':   '/insurance',
    '/b2c/series-fare': '/series-fare',
  }
  for (const [from, to] of Object.entries(b2cToCommon)) {
    if (pathname === from || pathname.startsWith(from + '/')) {
      const url = new URL(to, request.url)
      request.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v))
      return NextResponse.redirect(url)
    }
  }

  // Redirect /b2c/booking/[id] → /booking/[id]
  if (pathname.startsWith('/b2c/booking/')) {
    const rest = pathname.replace('/b2c/booking', '/booking')
    const url = new URL(rest, request.url)
    request.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v))
    return NextResponse.redirect(url)
  }

  // ── Redirect /b2c/search → /flights ──────────────────────────────────────
  if (pathname === '/b2c/search' || pathname.startsWith('/b2c/search/')) {
    const url = new URL('/flights', request.url)
    request.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v))
    return NextResponse.redirect(url)
  }

  // ── Public pages — no auth needed ─────────────────────────────────────────
  const publicRoutes = [
    '/',
    '/flights', '/hotels', '/insurance', '/series-fare',
    '/b2b/login', '/b2b/register', '/b2b/kyc', '/b2b/forgot-password', '/b2b/reset-password',
    '/b2c/login', '/b2c/register',
  ]

  if (publicRoutes.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next()
  }

  // ── Static / Next internals — skip ────────────────────────────────────────
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  // ── B2B agent dashboard — must be logged in ───────────────────────────────
  if (pathname.startsWith('/b2b')) {
    if (!token) {
      const url = new URL('/b2b/login', request.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // ── Common booking detail — must be logged in ────────────────────────────
  // /booking/[bookingId] is shared — both B2B agents and B2C customers reach it
  if (pathname.startsWith('/booking/') && !token) {
    const url = new URL('/b2c/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // ── B2C protected pages ───────────────────────────────────────────────────
  const b2cProtected = ['/b2c/my-trips', '/b2c/profile']
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
