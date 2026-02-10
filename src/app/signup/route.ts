import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ref = searchParams.get("ref");
  
  // Redirect to login (or onboarding start page)
  const response = NextResponse.redirect(new URL("/login", request.url));
  
  if (ref) {
    // Store referral code in cookie for attribution later
    response.cookies.set("nodebase-referral-code", ref, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days window
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    });
  }
  
  return response;
}
