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

  // 2. Redirect /admin requests to dedicated Admin Portal (port 3002)
  if (pathname.startsWith('/admin')) {
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002'
    return NextResponse.redirect(new URL(pathname, adminUrl))
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

  const isWorkbenchRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/orders') ||
    pathname.startsWith('/earnings') ||
    pathname.startsWith('/payouts') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/settings')

  // Unauthenticated guests accessing protected workbench routes get redirected to login/onboarding
  if (!hasAnyToken) {
    if (isWorkbenchRoute) {
      return NextResponse.redirect(new URL('/?auth=required', request.url))
    }
    return NextResponse.next()
  }

  // Extract role directly from token payload as primary source of truth
  const tokenPayload = decodeJwtPayload(token) || decodeJwtPayload(refreshToken)
  let role = tokenPayload?.role || request.cookies.get('tg_user_role')?.value || (tokenPayload?.type === 'pending_google_signup' ? 'TEMP_STUDIO' : 'STUDIO')

  // Unauthenticated or Customer users visiting workbench are redirected
  if (role === 'CUSTOMER') {
    if (isWorkbenchRoute) {
      if (CUSTOMER_SITE_URL) {
        return NextResponse.redirect(new URL(CUSTOMER_SITE_URL))
      }
      return NextResponse.redirect(new URL('/?auth=required', request.url))
    }
    return NextResponse.next()
  }

  // TEMP_STUDIO role is onboarding-only
  if (role === 'TEMP_STUDIO') {
    if (isWorkbenchRoute) {
      return NextResponse.redirect(new URL('/?step=1', request.url))
    }
    return NextResponse.next()
  }

  // Active STUDIO / ADMIN partner: redirect root to /dashboard unless ?step is present
  if (role === 'STUDIO' || role === 'ADMIN') {
    if (pathname === '/' && !searchParams.has('step')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export default proxy

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|woff|woff2)$).*)',
  ],
}
