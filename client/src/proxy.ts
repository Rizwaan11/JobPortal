import { NextResponse, NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('access_token');

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: '/dashboard/:path*',
};