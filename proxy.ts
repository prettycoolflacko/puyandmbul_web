import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.SESSION_SECRET || "fallback-secret-key-change-me";
const encodedKey = new TextEncoder().encode(secretKey);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page, auth API, and spotify OAuth API
  if (pathname === "/login" || pathname.startsWith("/api/auth") || pathname.startsWith("/api/spotify")) {
    return NextResponse.next();
  }

  // Allow static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/uploads")
  ) {
    return NextResponse.next();
  }

  // Check session cookie
  const session = request.cookies.get("session")?.value;
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verify JWT synchronously is not possible with jose, so we do async
  // But proxy can be async, so let's verify
  return verifySession(session, request);
}

async function verifySession(session: string, request: NextRequest) {
  try {
    await jwtVerify(session, encodedKey, { algorithms: ["HS256"] });
    return NextResponse.next();
  } catch {
    // Invalid or expired session
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("session");
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads).*)",
  ],
};
