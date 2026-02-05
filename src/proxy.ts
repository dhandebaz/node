import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth/jwt";

const COOKIE_NAME = "nodebase_session";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define protected routes
  const isAdminRoute = path.startsWith("/admin");
  const isDashboardRoute = path.startsWith("/dashboard");
  const isInvestorRoute = path.startsWith("/node/dashboard");
  const isProtected = isAdminRoute || isDashboardRoute || isInvestorRoute;
  
  const isLoginRoute = path === "/login" || path === "/admin/login";

  // Check for session
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  const session = cookie ? await decrypt(cookie) : null;

  // 1. Protected Routes
  if (isProtected) {
    if (!session) {
      const loginUrl = new URL("/login", request.nextUrl);
      // Optional: Add ?from=path to redirect back after login
      return NextResponse.redirect(loginUrl);
    }

    // Role-based access control
    if (isAdminRoute && session.role !== "superadmin") {
      // Non-admin trying to access admin
      return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    }
  }

  // 2. Auth Routes (Login)
  if (isLoginRoute && session) {
    // Already logged in, redirect based on role
    if (session.role === "superadmin") {
      return NextResponse.redirect(new URL("/admin", request.nextUrl));
    } else {
      // Default user redirect (could be refined based on user products if we had that info in session)
      // For now, go to the main dashboard switcher
      return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/node/dashboard/:path*",
    "/login",
    "/admin/login"
  ],
};
