import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // When an authenticated customer visits root '/', redirect seamlessly to '/book'
  if (pathname === '/') {
    const token = request.cookies.get('tg_token')?.value
    const role = request.cookies.get('tg_user_role')?.value

    if (token && role === 'CUSTOMER') {
      return NextResponse.redirect(new URL('/book', request.url))
    }
  }

  return NextResponse.next()
}

export default proxy

export const config = {
  matcher: ['/'],
}
