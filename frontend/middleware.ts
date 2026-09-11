import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    const token = request.cookies.get('tg_token')?.value
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

    const isCustomerProtected =
      pathname === '/book' ||
      pathname.startsWith('/book/') ||
      pathname === '/orders' ||
      pathname.startsWith('/orders/') ||
      pathname === '/profile' ||
      pathname.startsWith('/profile/')

    // Redirect unauthenticated guests attempting to visit protected customer routes
    if (isCustomerProtected && !token) {
      return NextResponse.redirect(new URL('/?auth=required', request.nextUrl.origin))
    }

    // When an authenticated CUSTOMER visits root '/', redirect seamlessly to '/book'
    // When a STUDIO user or guest visits root '/', let them access '/' freely
    if (pathname === '/') {
      if (token && role === 'CUSTOMER') {
        return NextResponse.redirect(new URL('/book', request.nextUrl.origin))
      }
    }

    return NextResponse.next()
  } catch (err) {
    console.error('Middleware execution error:', err)
    return NextResponse.next()
  }
}

export default middleware

export const config = {
  matcher: ['/', '/book', '/book/:path*', '/orders', '/orders/:path*', '/profile', '/profile/:path*'],
}
