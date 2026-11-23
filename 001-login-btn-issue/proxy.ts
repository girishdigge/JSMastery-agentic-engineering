import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Optimistic auth gate: redirect based only on the presence of the session
// cookie. The real session check happens in each page/action via getSession().
const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/login"];

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const hasSession = Boolean(request.cookies.get("session")?.value);

  if (protectedRoutes.includes(path) && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  if (publicRoutes.includes(path) && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$).*)"],
};
