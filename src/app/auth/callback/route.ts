import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard/ai';

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return (request.headers.get('cookie') ?? '').split('; ').map((c) => {
              const [name, value] = c.split('=');
              return { name, value };
            });
          },
          setAll(cookiesToSet) {
            // No-op here, handled below
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';
      
      let redirectUrl = `${origin}${next}`;
      if (!isLocalEnv && forwardedHost) {
        redirectUrl = `https://${forwardedHost}${next}`;
      }

      const response = NextResponse.redirect(redirectUrl);
      
      // Create a fresh client to get the session cookies that were just set in memory
      // and apply them to the response
      const supabaseResponse = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return (request.headers.get('cookie') ?? '').split('; ').map((c) => {
                const [name, value] = c.split('=');
                return { name, value };
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
      
      // Re-exchange (or just get session) to trigger setAll on the response object
      await supabaseResponse.auth.exchangeCodeForSession(code);

      return response;
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}
