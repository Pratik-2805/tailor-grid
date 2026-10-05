import { NextResponse, type NextRequest } from 'next/server'

const CUSTOMER_SITE_URL = process.env.NEXT_PUBLIC_CUSTOMER_SITE_URL || 'http://localhost:3000'

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // 1. Allow internal assets, static files, and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico' ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|woff|woff2)$/)
  ) {
    return NextResponse.next()
  }

  // 2. Allow super-admin routes
  if (pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // 3. Allow OAuth exchange callback route
  if (pathname.startsWith('/auth/callback')) {
    return NextResponse.next()
  }

  // 4. If URL has single-use auth code or token, forward to /auth/callback
  if (searchParams.has('code') || searchParams.has('token')) {
    const callbackUrl = new URL('/auth/callback', request.url)
    callbackUrl.search = request.nextUrl.search
    return NextResponse.redirect(callbackUrl)
  }

  // 5. Check authentication & role from cookies or JWT token
  const token = request.cookies.get('tg_token')?.value || request.cookies.get('token')?.value
  let role = request.cookies.get('tg_user_role')?.value

  if (!token) {
    return NextResponse.redirect(new URL(CUSTOMER_SITE_URL))
  }

  // If role cookie is not set or uncertain, decode role from JWT
  if (!role || role === 'undefined' || role === 'null') {
    try {
      const parts = token.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'))
        role = payload.role || (payload.type === 'pending_google_signup' ? 'TEMP_STUDIO' : 'TEMP_STUDIO')
      }
    } catch {
      role = 'TEMP_STUDIO'
    }
  }

  // Unauthenticated or Customer users cannot access Studio at all
  if (role === 'CUSTOMER') {
    return NextResponse.redirect(new URL(CUSTOMER_SITE_URL))
  }

  // TEMP_STUDIO role is strictly restricted to onboarding steps
  if (role === 'TEMP_STUDIO') {
    const isOnboardingRoute = pathname === '/' || pathname.startsWith('/onboarding')
    if (!isOnboardingRoute) {
      return NextResponse.redirect(new URL('/?step=1', request.url))
    }
    return NextResponse.next()
  }

  // STUDIO (and ADMIN) full partner role
  if (role === 'STUDIO' || role === 'ADMIN') {
    if (pathname === '/' && !searchParams.has('step')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Allow next for valid tokens by default on root onboarding
  return NextResponse.next()
}

export default proxy

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|woff|woff2)$).*)',
  ],
}
