import { NextResponse } from "next/server";
export function proxy(request) {
  if (!request.cookies.get("token")) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set(
      "next",
      request.nextUrl.pathname + request.nextUrl.search,
    );
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
export const config = {
  matcher: ["/checkout", "/profile", "/orders/:path*", "/wishlist"],
};
