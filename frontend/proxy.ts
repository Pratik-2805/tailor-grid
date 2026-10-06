import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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
  try {
    const { pathname } = request.nextUrl

    const token = request.cookies.get('tg_token')?.value
    const refreshToken = request.cookies.get('tg_refresh_token')?.value
    const hasAnyToken = Boolean(token || refreshToken)

    // Decode role directly from JWT Access Token or Refresh Token
    const tokenPayload = decodeJwtPayload(token) || decodeJwtPayload(refreshToken)
    const role = tokenPayload?.role

    const studioUrl = process.env.NEXT_PUBLIC_STUDIO_URL || process.env.STUDIO_URL || ''

    // When a STUDIO partner is logged in, restrict them exclusively to Studio Workbench
    if (hasAnyToken && role === 'STUDIO' && studioUrl) {
      return NextResponse.redirect(new URL(studioUrl))
    }

    const isCustomerProtected =
      pathname === '/book' ||
      pathname.startsWith('/book/') ||
      pathname === '/orders' ||
      pathname.startsWith('/orders/') ||
      pathname === '/order' ||
      pathname.startsWith('/order/') ||
      pathname === '/profile' ||
      pathname.startsWith('/profile/')

    // Redirect unauthenticated guests attempting to visit protected customer routes (only if no token and no refresh token)
    if (isCustomerProtected && !hasAnyToken) {
      return NextResponse.redirect(new URL('/?auth=required', request.nextUrl.origin))
    }

    // When an authenticated CUSTOMER visits root '/', redirect seamlessly to '/book'
    if (pathname === '/') {
      if (hasAnyToken && role === 'CUSTOMER') {
        return NextResponse.redirect(new URL('/book', request.nextUrl.origin))
      }
    }

    return NextResponse.next()
  } catch (err) {
    console.error('Proxy execution error:', err)
    return NextResponse.next()
  }
}

export default proxy

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|woff|woff2)$).*)',
  ],
}
