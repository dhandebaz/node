import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 1. Initialize Supabase Client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 2. Get User Session
  // This is safe because we are in middleware.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  
  // 3. Define Route Types
  const isPublicRoute = 
    path === '/login' || 
    path === '/auth/callback' || 
    path.startsWith('/auth') || // crucial for magic links
    path.startsWith('/public') || 
    path === '/' ||
    path.startsWith('/_next') ||
    path.startsWith('/static') ||
    path.includes('.') // assets

  const isApiRoute = path.startsWith('/api/')
  const isDashboardRoute = path.startsWith('/dashboard')
  const isOnboardingRoute = path.startsWith('/onboarding')
  const isAdminRoute = path.startsWith('/admin')

  // 4. API Security (Basic)
  if (isApiRoute) {
    // If it's an admin API, verify role
    if (path.startsWith('/api/admin')) {
      const role = user?.user_metadata?.role || 'customer'
      if (!user || (role !== 'admin' && role !== 'superadmin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
    return response
  }

  // 5. Unauthenticated Handling
  if (!user) {
    // Allow public routes
    if (isPublicRoute) {
      return response
    }
    
    // Redirect everything else to login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', path)
    return NextResponse.redirect(url)
  }

  // 6. Authenticated Handling (User exists)
  const role = user.user_metadata?.role || 'customer'
  const isAdmin = role === 'admin' || role === 'superadmin'

  // 6.1 Admin Routing
  if (isAdmin) {
    // Admins go to /admin/overview, not customer dashboard
    if (isDashboardRoute || isOnboardingRoute || path === '/login' || path === '/') {
      return NextResponse.redirect(new URL('/admin/overview', request.url))
    }
    return response
  }

  // 6.2 Customer Routing (The Critical Part)
  // We need to determine if they have a tenant to send them to Dashboard,
  // or if they need to go to Onboarding.

  // Check Cookie first (Fast path)
  let tenantId = request.cookies.get('nodebase-tenant-id')?.value

  // If no cookie, check DB (Source of Truth)
  if (!tenantId) {
    // We use `maybeSingle` to avoid error if 0 rows.
    const { data: membership } = await supabase
      .from('tenant_users')
      .select('tenant_id')
      .eq('user_id', user.id)
      .maybeSingle()
    
    if (membership) {
      tenantId = membership.tenant_id
      // Persist to cookie for next request
      response.cookies.set('nodebase-tenant-id', tenantId, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30 // 30 days
      })
    }
  }

  // 6.3 Final Routing Decision
  
  if (tenantId) {
    // User HAS a tenant -> Enforce Dashboard
    if (isOnboardingRoute || path === '/login' || path === '/') {
      return NextResponse.redirect(new URL('/dashboard/ai', request.url))
    }
    // Allow dashboard access
    return response
  } else {
    // User has NO tenant -> Enforce Onboarding
    if (isDashboardRoute || path === '/login' || path === '/') {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
    // Allow onboarding access
    return response
  }
}
