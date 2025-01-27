import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const path = request.nextUrl.pathname

  // If trying to access login/signup while authenticated
  if (token && (path === '/login' || path === '/signup')) {
    return NextResponse.redirect(new URL('/wishlists', request.url))
  }

  // If trying to access protected routes while not authenticated
  if (!token && path.startsWith('/wishlists')) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('returnUrl', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/signup', '/wishlists/:path*']
} 