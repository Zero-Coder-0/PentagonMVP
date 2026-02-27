import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 1. Define the Role Permissions Map based on full plan.txt
const ROLE_PERMISSIONS = {
    vendor: ['/vendor'],
    salesman: ['/vendor', '/dashboard'],
    tenant_admin: ['/admin', '/vendor', '/dashboard'], // Specifically blocked from /admin/superdashboard verbally, but we'll enforce below if needed
    super_admin: ['/'], // Wildcard access
    pending: ['/approval-pending'], // For new Google logins waiting for admin assignment
} as const;

export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    // Initialize Supabase Client for the Edge runtime
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
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const path = request.nextUrl.pathname

    // Public routes that don't need RBAC — checked FIRST before any cookie/session access
    // This is critical: /auth/callback must NOT have getUser() called before it,
    // otherwise the PKCE code verifier cookie gets consumed and exchangeCodeForSession fails.
    if (
        path.startsWith('/_next') ||
        path.startsWith('/api') ||
        path.startsWith('/static') ||
        path === '/login' ||
        path === '/fake-login' ||
        path === '/approval-pending' ||
        path.startsWith('/auth/callback')
    ) {
        return supabaseResponse
    }

    // getUser() validates the token safely against the server
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // getSession() decodes the local JWT cookie which CONTAINS our injected custom claims!
    const {
        data: { session },
    } = await supabase.auth.getSession()

    // If not logged in and trying to access protected routes, redirect to login
    if (!user && path !== '/') {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (user && session) {
        // 1. Instantly extract the user's custom claims from their signed JWT cookie
        const role = session.user.app_metadata?.role || 'vendor' // Strangers default to vendor
        const is_active = session.user.app_metadata?.is_active === true // Ensure strictly true

        // 2. Enforce the Waiting Room Constraint for non-active users
        if (!is_active && path !== '/approval-pending') {
            return NextResponse.redirect(new URL('/approval-pending', request.url))
        }

        // 3. Enforce the Strict Routing Matrix for Approved Users
        if (is_active) {
            // Super Admin gets access to everything
            if (role === 'super_admin') {
                return supabaseResponse
            }

            // Tenant Admin: blocked from /superdashboard variants
            if (role === 'tenant_admin' && path.startsWith('/admin/superdashboard')) {
                return NextResponse.redirect(new URL('/admin', request.url))
            }

            // Salesman: Can visit /dashboard and /vendor. Blocked from /admin
            if (role === 'salesman' && path.startsWith('/admin')) {
                return NextResponse.redirect(new URL('/dashboard', request.url))
            }

            // Vendor: Can visit /vendor only. Blocked from /admin and /dashboard
            if (role === 'vendor' && (path.startsWith('/admin') || path.startsWith('/dashboard'))) {
                return NextResponse.redirect(new URL('/vendor', request.url))
            }
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
