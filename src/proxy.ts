
//testing requirement







import { type NextRequest, NextResponse } from 'next/server'



export async function proxy(request: NextRequest) {
  // 1. ALLOW EVERYTHING. Do not check cookies.
  return NextResponse.next()
}



export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}





/*

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'



export async function proxy(request: NextRequest) {
  // 1. Setup Response & Supabase
  let response = NextResponse.next({
    request: { headers: request.headers },
  })



  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )



  // 1. Get the User (Fresh Fetch)
  const { data: { user } } = await supabase.auth.getUser()
  const url = request.nextUrl.clone()
  const path = url.pathname



  // 2. PUBLIC PATHS (Allow access without login)
  const isPublic = 
    path === '/' || 
    path.startsWith('/login') || 
    path.startsWith('/auth') || 
    path.startsWith('/fake-login') || // The trap page
    path.startsWith('/approval-pending');



  if (isPublic) {
    // If already logged in, redirect away from login to their home
    if (user && path === '/login') {
      // We will check role below to decide WHERE to send them
      // But for now, let the flow continue to the role check
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
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single()


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
       // Default fallback
       url.pathname = '/dashboard'
       return NextResponse.redirect(url)
    }


    const role = profile?.role


    // 5. ROUTING LOGIC (Role-based access control)
    
    // A. Super Admin (You) -> Can go anywhere
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



export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (Exclude auth routes entirely from middleware!)
     * - public (Any public assets)
     */
 /*  '/((?!_next/static|_next/image|favicon.ico|auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
*/