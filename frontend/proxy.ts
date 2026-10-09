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

    // 1. Allow public static assets and auth API requests to pass through
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname === '/favicon.ico' ||
      pathname.includes('.')
    ) {
      return NextResponse.next()
    }

    const token = request.cookies.get('tg_token')?.value || request.cookies.get('token')?.value
    const refreshToken = request.cookies.get('tg_refresh_token')?.value || request.cookies.get('refreshToken')?.value
    const hasAnyToken = Boolean(token || refreshToken)

    // 2. Prevent infinite redirect loops on auth pages
    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/auth')
    if (isAuthPage && hasAnyToken) {
      return NextResponse.next()
    }

    // 3. Extract role directly from token payload (Refresh Token primary)
    const tokenPayload = decodeJwtPayload(refreshToken) || decodeJwtPayload(token)
    const role = tokenPayload?.role || request.cookies.get('tg_user_role')?.value

    // 4. If authenticated user has role CUSTOMER, deny access to '/' and partner pages, redirecting directly to /book
    if (role === 'CUSTOMER') {
      if (pathname === '/') {
        return NextResponse.redirect(new URL('/book', request.url))
      }
      if (
        pathname === '/for-partners' ||
        pathname.startsWith('/for-partners/') ||
        pathname === '/partner' ||
        pathname.startsWith('/partner/')
      ) {
        return NextResponse.redirect(new URL('/book', request.url))
      }
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

    // 5. Redirect unauthenticated guests attempting to visit protected customer routes
    if (isCustomerProtected && !hasAnyToken) {
      return NextResponse.redirect(new URL('/?auth=required', request.nextUrl.origin))
    }

    return NextResponse.next()
  } catch (err) {
    console.error('Frontend proxy execution error:', err)
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
