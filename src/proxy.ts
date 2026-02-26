import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * PROXY MIDDLEWARE (RBAC GATEKEEPER)
 * This logic handles:
 * 1. Session persistence via Supabase cookies
 * 2. Public vs Private path routing
 * 3. Role-based access control (RBAC) redirect logic
 * 4. Active status verification
 */

export async function proxy(request: NextRequest) {
  // 1. Setup Response & Supabase
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // DEV MODE BYPASS - If we want to "push data" without full RBAC blocks in dev
  // You can toggle this if you want to bypass middleware in localhost
  const isDev = process.env.NODE_ENV === 'development';
  const DEV_BYPASS_AUTH = process.env.DEV_BYPASS_AUTH === 'true';

  if (isDev && DEV_BYPASS_AUTH) {
    return NextResponse.next();
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
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

  // 1. Get the User (Fresh Fetch)
  const { data: { user } } = await supabase.auth.getUser()
  const url = request.nextUrl.clone()
  const path = url.pathname

  // Log auth status for debugging (Dev mode only)
  if (isDev) {
    console.log(`[Middleware] Path: ${path} | User: ${user?.email || 'Guest'}`);
  }

  // 2. PUBLIC PATHS (Allow access without login)
  const isPublic =
    path === '/' ||
    path.startsWith('/login') ||
    path.startsWith('/auth') ||
    path.startsWith('/fake-login') ||
    path.startsWith('/approval-pending');

  if (isPublic) {
    // If already logged in, redirect away from Login or Home to their respective dashboard
    if (user && (path === '/login' || path === '/')) {
      // Continue to role-check below
    } else {
      return response
    }
  }

  // 3. FORCE LOGIN
  if (!user && !isPublic) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 4. FETCH ROLE & CHECK STATUS (If user exists)
  if (user) {
    let profile: { role: string; is_active: boolean } | null = null;
    if (isDev && DEV_BYPASS_AUTH) {
      const devRole = process.env.DEV_ROLE || 'super_admin';
      profile = { role: devRole, is_active: true };
    } else {
      const { data, error } = await supabase
        .from('users') // <-- Changed from profiles to users
        .select('role, is_active')
        .eq('id', user.id) // Ensure supabase id matches Prisma User id
        .single();

      if (error) {
        console.error('[Middleware] Error fetching user role from Prisma users table:', error.message);
      }
      profile = data as any;
    }

    // Removed duplicate profile fetch; using dev bypass logic above

    // DEV MODE PUSH: If in dev mode and we want to bypass strict blocks
    // we still check profile but we won't redirect-loop as hard
    if (isDev && path.startsWith('/admin/inventory/new')) {
      // Allow "pushing data" in dev mode specifically for the wizard
      return response;
    }

    // A. Block inactive users (Send to Approval Pending)
    if ((!profile || !profile.is_active) && !path.startsWith('/approval-pending') && !path.startsWith('/auth/signout')) {
      url.pathname = '/approval-pending'
      return NextResponse.redirect(url)
    }

    // B. ESCAPE HATCH: If Active but stuck on Approval Page -> Redirect to Home
    if (profile?.is_active && path.startsWith('/approval-pending')) {
      if (profile.role === 'super_admin') {
        url.pathname = '/super'
        return NextResponse.redirect(url)
      }
      if (profile.role === 'tenant_admin') {
        url.pathname = '/admin'
        return NextResponse.redirect(url)
      }
      if (profile.role === 'vendor') {
        url.pathname = '/vendor'
        return NextResponse.redirect(url)
      }
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    const role = profile?.role

    // 5. ROUTING LOGIC (Role-based access control)

    // A. REDIRECT AUTHENTICATED USERS AWAY FROM PUBLIC PAGES (Login/Home)
    if (path === '/login' || path === '/') {
      if (role === 'super_admin') return NextResponse.redirect(new URL('/super', request.url))
      if (role === 'tenant_admin') return NextResponse.redirect(new URL('/admin', request.url))
      if (role === 'vendor') return NextResponse.redirect(new URL('/vendor', request.url))
      if (role === 'salesman') return NextResponse.redirect(new URL('/dashboard', request.url))
      // Default fallback
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // B. Super Admin -> Can go anywhere
    if (role === 'super_admin') {
      return response
    }

    // B. Tenant Admin -> /admin. Blocked from /super
    if (role === 'tenant_admin') {
      if (path.startsWith('/super')) {
        url.pathname = '/admin'
        return NextResponse.redirect(url)
      }
    }

    // C. Sales -> /dashboard. Blocked from /admin, /vendor, /super
    if (role === 'salesman') {
      if (path.startsWith('/admin') || path.startsWith('/vendor') || path.startsWith('/super')) {
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    }

    // D. Vendor -> /vendor. Blocked from /dashboard, /admin, /super
    if (role === 'vendor') {
      if (path.startsWith('/dashboard') || path.startsWith('/admin') || path.startsWith('/super')) {
        url.pathname = '/vendor'
        return NextResponse.redirect(url)
      }
    }
  }

  return response
}