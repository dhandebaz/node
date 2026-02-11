import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // Public routes that don't need auth
  const isPublicRoute = 
    path === '/login' || 
    path === '/auth/callback' || 
    path.startsWith('/auth') ||
    path.startsWith('/public') || 
    path === '/' ||
    path.startsWith('/_next') ||
    path.startsWith('/static') ||
    path.includes('.') // file extensions

  if (path.startsWith('/api/')) {
    // API protection is handled by interceptors/handlers, but we can enforce strict auth here for specific routes if needed.
    // For now, let's leave API to the route handlers/interceptors as per "API INTERCEPTOR" requirement, 
    // BUT the requirement says "Admin checks must exist at route + API layer".
    // So if it's /api/admin/*, we should probably check here too.
    if (path.startsWith('/api/admin')) {
      if (!user || user.user_metadata?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
    return response
  }

  // 1. Redirect unauthenticated users to login
  if (!user && !isPublicRoute) {
    // Redirect to login if accessing protected routes
    if (path.startsWith('/dashboard') || path.startsWith('/admin') || path.startsWith('/node/dashboard')) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('next', path)
        return NextResponse.redirect(url)
    }
  }

  // 2. Redirect authenticated users away from login
  if (user && path === '/login') {
    const role = user.user_metadata?.role || 'customer'
    const url = request.nextUrl.clone()
    if (role === 'admin') {
        url.pathname = '/admin/dashboard'
    } else if (role === 'investor') {
        url.pathname = '/node/dashboard/overview'
    } else {
        url.pathname = '/dashboard/overview' // or whatever the customer home is
    }
    return NextResponse.redirect(url)
  }

  // 3. Strict Role Separation
  if (user) {
    const role = user.user_metadata?.role || 'customer'

    // Customer trying to access Admin routes
    if (path.startsWith('/admin') && role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard/overview' // Redirect to their safe space
        return NextResponse.redirect(url)
    }

    // Investor Routes
    if (path.startsWith('/node/dashboard')) {
        if (role !== 'investor' && role !== 'admin' && role !== 'superadmin') {
             const url = request.nextUrl.clone()
             url.pathname = '/dashboard/overview'
             return NextResponse.redirect(url)
        }
    }

    // Admin trying to access Customer routes? 
    // Requirement: "Admin and customer areas are strictly isolated"
    // Requirement: "Admin user cannot open customer dashboard"
    if (path.startsWith('/dashboard') && role === 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/admin/dashboard'
        return NextResponse.redirect(url)
    }
  }

  return response
}
