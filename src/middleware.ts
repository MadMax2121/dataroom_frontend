import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: [
    // protect everything except auth pages, next.js internals, and static assets
    "/((?!api/auth|_next|fonts|images|favicon.ico|login|register).*)",
  ],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // allow public auth pages
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return NextResponse.next();
  }

  // try to read & verify the NextAuth JWT-session cookie
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  console.log("🔑 middleware token:", token);

  if (!token) {
    // no valid session → redirect to login
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // valid session → continue
  return NextResponse.next();
}
