import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const currentPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const isProtectedPath = ["/dashboard", "/portal", "/admin"].some(
    (path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(`${path}/`),
  );

  if (!accessToken) {
    if (refreshToken) {
      const renewalUrl = new URL("/auth/renew-session", request.url);
      renewalUrl.searchParams.set("returnTo", currentPath);
      return NextResponse.redirect(renewalUrl);
    }

    if (isProtectedPath) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-current-path", currentPath);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/portal/:path*",
    "/admin/:path*",
    "/jobs/:path*",
    "/login",
    "/register",
    "/verify-email",
  ],
};
