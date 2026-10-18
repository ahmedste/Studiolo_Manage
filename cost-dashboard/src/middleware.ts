import { NextResponse, type NextRequest } from "next/server";

/**
 * Password gate (HTTP Basic auth). Vercel's built-in password protection isn't on the Hobby plan,
 * so the dashboard guards itself. With no DASHBOARD_PASSWORD set it refuses everything outside dev.
 */
export function middleware(req: NextRequest) {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) {
    if (process.env.NODE_ENV === "development") return NextResponse.next();
    return new NextResponse("Set DASHBOARD_PASSWORD to open the dashboard.", { status: 503 });
  }
  const header = req.headers.get("authorization") ?? "";
  if (header.startsWith("Basic ")) {
    const [, pass] = atob(header.slice(6)).split(/:(.*)/s);
    if (pass !== undefined && timingSafeEqual(pass, password)) return NextResponse.next();
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Studiolo costs", charset="UTF-8"' },
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
