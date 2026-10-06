import { NextResponse, type NextRequest } from 'next/server'

const CUSTOMER_SITE_URL = process.env.NEXT_PUBLIC_CUSTOMER_SITE_URL || process.env.CUSTOMER_SITE_URL || ''

function decodeJwtPayload<T = any>(token: string | null | undefined): T | null {
  if (!token || typeof token !== 'string') return null
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    if (typeof atob === 'function') {
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload) as T
    } else if (typeof Buffer !== 'undefined') {
      return JSON.parse(Buffer.from(base64, 'base64').toString('utf8')) as T
    }
    return null
  } catch {
    return null
  }
}

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

  // 5. Check authentication & role from JWT token (Access Token or Refresh Token)
  const token = request.cookies.get('tg_token')?.value || request.cookies.get('token')?.value
  const refreshToken = request.cookies.get('tg_refresh_token')?.value || request.cookies.get('refreshToken')?.value
  const hasAnyToken = Boolean(token || refreshToken)

  if (!hasAnyToken) {
    return NextResponse.redirect(new URL(CUSTOMER_SITE_URL))
  }

  // Extract role directly from token payload as primary source of truth
  const tokenPayload = decodeJwtPayload(token) || decodeJwtPayload(refreshToken)
  let role = tokenPayload?.role || request.cookies.get('tg_user_role')?.value || (tokenPayload?.type === 'pending_google_signup' ? 'TEMP_STUDIO' : 'STUDIO')

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
