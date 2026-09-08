import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // When an authenticated CUSTOMER visits root '/', redirect seamlessly to '/book'
  // When a STUDIO user or guest visits root '/', let them access '/' freely
  if (pathname === '/') {
    const token = request.cookies.get('tg_token')?.value
    let role = request.cookies.get('tg_user_role')?.value

    if (!role && request.cookies.get('tg_user')?.value) {
      try {
        const userObj = JSON.parse(decodeURIComponent(request.cookies.get('tg_user')!.value))
        role = userObj?.role
      } catch {}
    }

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
