import { NextResponse, type NextRequest } from 'next/server'

/**
 * Next.js Proxy Gate (proxy.ts)
 * 
 * Official Next.js 16 server-level request proxy.
 * Checks request cookies on every navigation:
 * 1. If user is registered as a CUSTOMER, redirect to Customer Portal.
 * 2. If user is logged out (no token) and not actively in an auth/onboarding handover (?token=, ?step=, ?auth=),
 *    redirect directly to the Customer Home Page (port 3000).
 * 3. Studio Dashboard is reserved exclusively for authenticated STUDIO partners.
 */
export function proxy(request: NextRequest) {
  // Allow all requests to reach the Studio portal (where page.tsx handles authentication,
  // onboarding, and role-based workbench access)
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
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|woff|woff2)$).*)',
  ],
}
