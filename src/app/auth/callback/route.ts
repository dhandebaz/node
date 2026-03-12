import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard/ai';

  if (code) {
    const forwardedHost = request.headers.get('x-forwarded-host');
    const isLocalEnv = process.env.NODE_ENV === 'development';
    
    let redirectUrl = `${origin}${next}`;
    if (!isLocalEnv && forwardedHost) {
      redirectUrl = `https://${forwardedHost}${next}`;
    }

    // Create the response object that we'll attach cookies to
    const response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            // Improved cookie parsing to handle values with '='
            return (request.headers.get('cookie') ?? '').split(';').map((c) => {
              const [name, ...rest] = c.trim().split('=');
              return { name, value: rest.join('=') };
            });
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return response;
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}
