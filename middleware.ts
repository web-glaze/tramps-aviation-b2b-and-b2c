import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  if (pathname.startsWith("/b2c/booking/")) {
    const rest = pathname.replace("/b2c/booking", "/booking");
    const url = new URL(rest, request.url);
    request.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));
    return NextResponse.redirect(url);
  }

  if (pathname === "/b2c/search" || pathname.startsWith("/b2c/search/")) {
    const url = new URL("/b2c/flights", request.url);
    request.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));
    return NextResponse.redirect(url);
  }

  const publicRoutes = [
    "/",
    "/flights",
    "/hotels",
    "/insurance",
    "/series-fare",
    "/b2b/login",
    "/b2b/register",
    "/b2b/kyc",
    "/b2b/forgot-password",
    "/b2b/reset-password",
    "/b2c/login",
    "/b2c/register",
    "/b2c/flights",
    "/b2c/hotels",
    "/b2c/insurance",
    "/b2c/series-fare",
  ];

  if (publicRoutes.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/b2b")) {
    if (!token) {
      const url = new URL("/b2b/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/booking/") && !token) {
    const url = new URL("/b2c/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  const b2cProtected = ["/b2c/my-trips", "/b2c/profile"];
  if (b2cProtected.some((r) => pathname.startsWith(r)) && !token) {
    const url = new URL("/b2c/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
