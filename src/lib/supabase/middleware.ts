import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "placeholder";

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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  
  // Define public routes
  const isPublicRoute = 
    path === '/login' || 
    path === '/auth/callback' || 
    path.startsWith('/auth') ||
    path.startsWith('/public') || 
    path === '/' ||
    path.startsWith('/_next') ||
    path.startsWith('/static') ||
    path.includes('.')

  // API Routes: Basic protection
  if (path.startsWith('/api/')) {
    if (path.startsWith('/api/admin')) {
      const role = user?.user_metadata?.role || 'customer'
      const isAdmin = role === 'admin' || role === 'superadmin'
      if (!user || !isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
    return response
  }

  // 1. Unauthenticated Users
  if (!user) {
    if (!isPublicRoute) {
      // Allow access to login, landing page, etc.
      // Redirect protected routes to login
      if (path.startsWith('/dashboard') || path.startsWith('/admin') || path.startsWith('/onboarding')) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('next', path)
        return NextResponse.redirect(url)
      }
    }
    return response
  }

  // 2. Authenticated Users - Role & Tenant Checks
  if (user) {
    const role = user.user_metadata?.role || 'customer'
    const isAdmin = role === 'admin' || role === 'superadmin'

    // 2.1 Admin Routing
    if (isAdmin) {
      if (path === '/login' || path === '/') {
        return NextResponse.redirect(new URL('/admin/overview', request.url))
      }
      if (path.startsWith('/dashboard') || path.startsWith('/onboarding')) {
        return NextResponse.redirect(new URL('/admin/overview', request.url))
      }
      return response
    }

    // 2.2 Customer Routing
    // Check Tenant Cookie
    const tenantCookie = request.cookies.get('nodebase-tenant-id')
    let tenantId = tenantCookie?.value

    // If no cookie, try to resolve from DB
    if (!tenantId) {
      // Check tenant_users table
      const { data: tenantUser } = await supabase
        .from('tenant_users')
        .select('tenant_id')
        .eq('user_id', user.id)
        .maybeSingle()
      
      if (tenantUser) {
        tenantId = tenantUser.tenant_id
        // Set cookie for future requests
        response.cookies.set('nodebase-tenant-id', tenantId, {
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 30 // 30 days
        })
      }
    }

    // Redirect logic based on tenant status
    const isOnboarding = path.startsWith('/onboarding')
    const isDashboard = path.startsWith('/dashboard')
    const isLogin = path === '/login'
    const isRoot = path === '/'

    if (tenantId) {
      // User has a tenant -> Should be in Dashboard
      if (isOnboarding || isLogin || isRoot) {
        const dashboardUrl = new URL('/dashboard/ai', request.url)
        return NextResponse.redirect(dashboardUrl)
      }
    } else {
      // User has NO tenant -> Should be in Onboarding
      if (isDashboard || isLogin || isRoot) {
        const onboardingUrl = new URL('/onboarding', request.url)
        return NextResponse.redirect(onboardingUrl)
      }
    }
  }

  return response
}
