# Advanced Supabase JWT Security Architecture (Future Roadmap)

This document outlines the enterprise-grade JWT Custom Claims approach to completely secure the application from client-side role injection while maintaining blazing-fast Edge filtering.

## 1. The Core Concept: JWT Custom Claims
Instead of querying the `public.users` table on every page load or relying on client-side state, we inject the user's `role` directly into their secure Supabase Session token (JWT) the moment they log in.

Because the JWT is cryptographically signed by Supabase, the user **cannot** manually alter their role in the browser.

## 2. Implementation Steps

### Step 1: The Postgres Trigger (The Injector)
We create a Postgres function and trigger in Supabase that automatically updates the user's `app_metadata` inside the hidden `auth.users` table whenever their role changes in `public.users`.

```sql
-- Create a function to mirror the role into the JWT
CREATE OR REPLACE FUNCTION public.sync_role_to_jwt()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the auth.users app_metadata with the role from public.users
  UPDATE auth.users
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    json_build_object('role', NEW.role)::jsonb
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Create the trigger on the public.users table
CREATE TRIGGER role_sync_trigger
AFTER INSERT OR UPDATE OF role
ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_role_to_jwt();
```

### Step 2: The Next.js Edge Middleware
The Middleware no longer queries the database. It instantly reads the verified JWT on every request.

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Initialize Supabase Client (Standard Setup)
  const supabase = createServerClient(...)
  
  // Get the signed session (reads from cookies, no database call)
  const { data: { session } } = await supabase.auth.getSession()

  // Extract the securely injected role
  const userRole = session?.user?.app_metadata?.role || 'pending'
  const path = request.nextUrl.pathname
  
  // ENFORCE PERMISSIONS (Extremely fast, executes on Vercel Edge)
  if (path.startsWith('/admin') && userRole !== 'super_admin' && userRole !== 'tenant_admin') {
     return NextResponse.redirect(new URL('/dashboard', request.url)) // Or fake-login
  }

  return NextResponse.next()
}
```

### Step 3: Optimized Row Level Security (RLS)
Database queries become drastically faster and cleaner because they read the active JWT in memory instead of executing correlated sub-queries against `public.users`.

```sql
-- OLD SLOW WAY
-- USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'super_admin')

-- NEW FAST WAY (JWT Check)
CREATE POLICY "Only admins can modify projects" ON public.projects
FOR ALL TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role') IN ('super_admin', 'tenant_admin')
);
```

## Summary of Benefits
1. **Unfakeable Permissions**: The role is signed by the server.
2. **Zero-Latency Routing**: Next.js Middleware routes instantly without database reads.
3. **Database Efficiency**: RLS avoids expensive sub-queries for every row evaluated.
