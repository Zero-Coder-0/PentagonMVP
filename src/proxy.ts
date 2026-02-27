import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 1. Define the Role Permissions Map based on full plan.txt
const ROLE_PERMISSIONS = {
    vendor: ['/vendor'],
    salesman: ['/vendor', '/dashboard'],
    tenant_admin: ['/admin', '/vendor', '/dashboard'], // Specifically blocked from /admin/superdashboard verbally, but we'll enforce below if needed
    super_admin: ['/'], // Wildcard access
    pending: ['/approval'], // For new Google logins waiting for admin assignment
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

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // Public routes that don't need RBAC
    if (
        path.startsWith('/_next') ||
        path.startsWith('/api') ||
        path.startsWith('/static') ||
        path === '/login' ||
        path === '/fake-login' ||
        path === '/auth/callback'
    ) {
        return supabaseResponse
    }

    // If not logged in and trying to access protected routes, redirect to login
    if (!user && path !== '/') {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (user) {
        // Basic fallback: if we don't have the advanced JWT setup, we fetch the role here.
        // NOTE: This runs on the Edge. Supabase Client queries are fast via HTTP.
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        const role = profile?.role || 'pending'

        // 2. Enforce RBAC rules

        // Super Admin gets a free pass everywhere
        if (role === 'super_admin') {
            return supabaseResponse
        }

        // Pending Users
        if (role === 'pending' && path !== '/approval') {
            return NextResponse.redirect(new URL('/approval', request.url))
        }

        // Tenant Admin specific blocks
        if (role === 'tenant_admin' && path.startsWith('/admin/superdashboard')) {
            return NextResponse.redirect(new URL('/admin', request.url))
        }

        // General Access Checks based on the Map
        if (role === 'tenant_admin' && path.startsWith('/admin')) return supabaseResponse;
        if (['tenant_admin', 'salesman'].includes(role) && path.startsWith('/dashboard')) return supabaseResponse;
        if (['tenant_admin', 'salesman', 'vendor'].includes(role) && path.startsWith('/vendor')) return supabaseResponse;

        // If they reach here and the path is protected but didn't match their allowed routes:
        if (path.startsWith('/admin') || path.startsWith('/dashboard') || path.startsWith('/vendor')) {
            // Bounce them to their primary home or fake-login
            if (role === 'vendor') return NextResponse.redirect(new URL('/vendor', request.url))
            if (role === 'salesman') return NextResponse.redirect(new URL('/dashboard', request.url))
            if (role === 'tenant_admin') return NextResponse.redirect(new URL('/admin', request.url))

            return NextResponse.redirect(new URL('/fake-login', request.url))
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
