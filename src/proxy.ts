import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Simple in-memory rate limiting for Edge/Middleware (per instance)
const rateLimit = new Map<string, { count: number; start: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60; // 1 request per second average

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;
  const method = request.method;

  const csrfTokenForSession = request.cookies.get("nodebase-csrf-token")?.value || crypto.randomUUID();

  // ==========================================
  // 0. Security Hardening (CSRF & Rate Limit)
  // ==========================================
  
  // Basic Rate Limiting for Auth/Payment routes
  if (pathname.startsWith("/api/wallet") || pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW;
    
    let stats = rateLimit.get(ip);
    if (!stats || stats.start < windowStart) {
      stats = { count: 1, start: now };
    } else {
      stats.count++;
    }
    rateLimit.set(ip, stats);

    if (stats.count > MAX_REQUESTS) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
    }
  }

  // ==========================================
  // 1. Supabase Initialization
  // ==========================================
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  response.cookies.set("nodebase-csrf-token", csrfTokenForSession, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  // ==========================================
  // 2. Security Checks (CSRF & Impersonation)
  // ==========================================
  
  // CSRF Protection for mutating API routes
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method) && pathname.startsWith("/api")) {
    if (!pathname.includes("/webhooks") && !pathname.includes("/webhook")) {
      const csrfToken = request.headers.get("x-csrf-token");
      const cookieToken = request.cookies.get("nodebase-csrf-token")?.value || csrfTokenForSession;
      if (process.env.NODE_ENV === "production") {
        if (!csrfToken || !cookieToken || csrfToken !== cookieToken) {
          return NextResponse.json({ error: "Missing CSRF token" }, { status: 403 });
        }
      }
    }
  }

  // Handle User Impersonation
  const impersonateTenantId = request.cookies.get("nodebase-impersonate-tenant-id")?.value;
  if (impersonateTenantId && user) {
    const role = user.user_metadata?.role as string | undefined;
    const isAdmin = role === "admin" || role === "superadmin";
    
    if (!isAdmin) {
      // Security: Clear the impersonation cookie if a non-admin tries to use it
      response.cookies.delete("nodebase-impersonate-tenant-id");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    
    // Admin is impersonating: Log it if needed (once per session logic could go here)
    // The getActiveTenantId will pick up the cookie automatically now.
  }

  // ==========================================
  // 1. Protected Customer Routes
  // ==========================================
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // ==========================================
  // 2. Admin Route Protection
  // ==========================================
  if (pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Check admin role from user metadata
    const role = user.user_metadata?.role as string | undefined;
    const isAdmin = role === "admin" || role === "superadmin";

    if (!isAdmin) {
      // Non-admin users get redirected to customer dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // ==========================================
  // 3. Auth Routes (Login/Signup) - Redirect if already logged in
  // ==========================================
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    if (user) {
      // Admins go to admin dashboard, others to customer
      const role = user.user_metadata?.role as string | undefined;
      const isAdmin = role === "admin" || role === "superadmin";
      const target = isAdmin ? "/admin/dashboard" : "/dashboard";
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  // ==========================================
  // 4. Onboarding Gate - Redirect to onboarding if not complete
  // ==========================================
  if (pathname.startsWith("/dashboard") && user) {
    // Skip for admin users and API routes
    const role = user.user_metadata?.role as string | undefined;
    const isAdmin = role === "admin" || role === "superadmin";

    if (!isAdmin && !pathname.startsWith("/dashboard/verification")) {
      // Check onboarding via user metadata (lightweight check)
      const onboardingComplete = user.user_metadata?.onboarding_status === "complete";
      if (!onboardingComplete && !pathname.startsWith("/onboarding")) {
        // Let the layout handle the actual redirect with full DB check
        // This is a lightweight hint only
      }
    }
  }

  // ==========================================
  // 5. API Route Protection
  // ==========================================
  if (pathname.startsWith("/api/admin") && !pathname.startsWith("/api/admin/webhooks")) {
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = user.user_metadata?.role as string | undefined;
    const isAdmin = role === "admin" || role === "superadmin";

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
