import { NextResponse, type NextRequest } from 'next/server'

/**
 * Next.js Proxy Gate (proxy.tsx)
 * 
 * Official Next.js 16 server-level request proxy.
 * Checks request cookies on every navigation. If the user is registered as a CUSTOMER,
 * it immediately intercepts the request, deletes customer cookies from the studio origin,
 * and redirects them to the Customer Portal (port 3000).
 */
export function proxy(request: NextRequest) {
  const roleCookie = request.cookies.get('tg_user_role')?.value
  const userCookie = request.cookies.get('tg_user')?.value

  let isCustomer = roleCookie === 'CUSTOMER'

  if (!isCustomer && userCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(userCookie))
      if (parsed && parsed.role === 'CUSTOMER') {
        isCustomer = true
      }
    } catch {
      // Ignored
    }
  }

  if (isCustomer) {
    const customerSiteUrl =
      process.env.NEXT_PUBLIC_CUSTOMER_SITE_URL ||
      (process.env.NEXT_PUBLIC_CUSTOMER_SITE_PORT ? `http://localhost:${process.env.NEXT_PUBLIC_CUSTOMER_SITE_PORT}` : 'http://localhost:3000')

    const redirectUrl = new URL(customerSiteUrl)
    redirectUrl.searchParams.set('unauthorized', 'studio_access_denied')

    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
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
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
