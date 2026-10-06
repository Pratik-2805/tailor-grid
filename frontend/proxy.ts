import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    const token = request.cookies.get('tg_token')?.value
    const refreshToken = request.cookies.get('tg_refresh_token')?.value
    const hasAnyToken = Boolean(token || refreshToken)
    let role = request.cookies.get('tg_user_role')?.value

    if (!role && request.cookies.get('tg_user')?.value) {
      try {
        const raw = request.cookies.get('tg_user')!.value
        const userObj = JSON.parse(decodeURIComponent(raw))
        role = userObj?.role
      } catch {
        try {
          const raw = request.cookies.get('tg_user')!.value
          const userObj = JSON.parse(raw)
          role = userObj?.role
        } catch {}
      }
    }

    const studioUrl =
      process.env.NEXT_PUBLIC_STUDIO_URL ||
      process.env.STUDIO_URL ||
      (process.env.NEXT_PUBLIC_STUDIO_PORT ? `http://localhost:${process.env.NEXT_PUBLIC_STUDIO_PORT}` : 'http://localhost:3001')

    // When a STUDIO partner is logged in, restrict them exclusively to Studio Workbench (port 3001)
    if (hasAnyToken && role === 'STUDIO') {
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
