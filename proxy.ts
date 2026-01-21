import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  const pathname = req.nextUrl.pathname;

  const isAuthPage = pathname.startsWith("/login");
  const isApi = pathname.startsWith("/api");
  const isNext = pathname.startsWith("/_next");
  const isPublic = pathname.startsWith("/bg.jpg") || pathname.startsWith("/favicon.ico");

  // allow public files + next internals
  if (isNext || isPublic) return NextResponse.next();

  // allow login page + api calls
  if (isAuthPage || isApi) return NextResponse.next();

  // protect dashboard routes
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
