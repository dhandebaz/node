import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth/jwt";

// Protected route prefixes
const protectedRoutes = [
  "/dashboard",
  "/admin",
  "/node/dashboard",
];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if the current path starts with any of the protected routes
  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );

  // If it's not a protected route, allow access
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Get the session cookie
  const cookie = request.cookies.get("nodebase_session")?.value;

  // If no cookie, redirect to login
  if (!cookie) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  // Decrypt the session
  const session = await decrypt(cookie);

  // If session is invalid or expired, redirect to login
  if (!session?.userId) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  // Role-based Access Control

  // Admin Routes (/admin/*)
  if (path.startsWith("/admin")) {
    // Only 'admin' or 'superadmin' can access
    if (session.role !== "admin" && session.role !== "superadmin") {
      return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    }
  }

  // Investor Routes (/node/dashboard/*)
  if (path.startsWith("/node/dashboard")) {
    // Only 'investor', 'admin', or 'superadmin' can access
    if (session.role !== "investor" && session.role !== "admin" && session.role !== "superadmin") {
      return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
    }
  }

  // 3. Customer Routes (/dashboard/*)
  // Generally accessible to all authenticated users, but we might want to restrict
  // specific sub-routes if necessary. For now, we assume all logged-in users
  // have a "customer" aspect or can view the dashboard.
  
  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - login (login page)
   * - public assets (images, etc - if any)
   */
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|login).*)",
  ],
};
