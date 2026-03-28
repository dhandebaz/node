import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getOrigin(request: Request): string {
  const forwardedProto = request.headers.get("x-forwarded-proto") || "http";
  const forwardedHost =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "localhost:3000";
  return `${forwardedProto}://${forwardedHost}`;
}

async function createSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll called from a Server Component  -  cookies can only be set in a Server Action or Route Handler
          }
        },
      },
    },
  );
}

/**
 * POST /api/auth/google
 * Returns a Google OAuth URL for API/mobile clients to redirect to.
 * Body (optional): { redirectTo?: string, next?: string }
 */
export async function POST(request: Request) {
  try {
    const origin = getOrigin(request);
    const supabase = await createSupabaseClient();

    let body: { redirectTo?: string; next?: string } = {};
    try {
      body = await request.json();
    } catch {
      // No body  -  proceed with defaults
    }

    const next = body.next || "/dashboard/ai";
    const redirectTo =
      body.redirectTo ||
      `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        scopes: "openid email profile",
      },
    });

    if (error || !data?.url) {
      return NextResponse.json(
        { error: error?.message || "Failed to initiate Google OAuth" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: data.url });
  } catch (err: any) {
    console.error("[Google OAuth] POST error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/auth/google
 * Directly redirects the browser to Google OAuth for server-side initiated logins.
 * Query params: ?next=/path/to/redirect/after/login
 */
export async function GET(request: Request) {
  try {
    const origin = getOrigin(request);
    const { searchParams } = new URL(request.url);
    const next = searchParams.get("next") || "/dashboard/ai";
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

    const supabase = await createSupabaseClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        scopes: "openid email profile",
      },
    });

    if (error || !data?.url) {
      console.error("[Google OAuth] Failed to generate URL:", error);
      return NextResponse.redirect(`${origin}/login?error=google-oauth-failed`);
    }

    return NextResponse.redirect(data.url);
  } catch (err: any) {
    console.error("[Google OAuth] GET error:", err);
    const origin = getOrigin(request);
    return NextResponse.redirect(`${origin}/login?error=google-oauth-failed`);
  }
}
