-- ==============================================================================
-- 0. DEFINE THE PRISMA ENUM (Safe creation)
-- ==============================================================================
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('super_admin', 'tenant_admin', 'salesman', 'vendor');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 1. DROP ALL EXISTING POLICIES TO START FRESH
-- ==============================================================================
DO $$
DECLARE 
  r RECORD;
  pol RECORD;
BEGIN
  FOR r IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    AND tablename IN (
      'users', 'leads', 'projects', 'project_units', 'project_specifications',
      'project_amenities', 'project_landmarks', 'project_commercials',
      'project_analysis', 'project_developers', 'project_competitors',
      'location_connectivity', 'site_visits', 'property_drafts'
    )
  LOOP
    FOR pol IN
      SELECT policyname 
      FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = r.tablename
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', pol.policyname, r.tablename);
    END LOOP;
  END LOOP;
END $$;

-- ==============================================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS) ON ALL 14 TABLES
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_landmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_commercials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_developers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_connectivity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_drafts ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 3. THE CUSTOM ACCESS TOKEN HOOK (THE MAGIC)
-- ==============================================================================
-- Supabase calls this automatically every time it creates a login token.
-- It safely reads the role from public.users and injects it into the JWT.

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  claims jsonb;
  user_role text;
  user_is_active boolean;
BEGIN
  -- Read the user's role and active status from YOUR table
  SELECT role::text, is_active
  INTO user_role, user_is_active
  FROM public.users
  WHERE id = (event->>'user_id')::uuid;

  -- Build the custom claims object
  claims := event->'claims';
  claims := jsonb_set(claims, '{app_metadata}',
    COALESCE(claims->'app_metadata', '{}'::jsonb) ||
    jsonb_build_object('role', COALESCE(user_role, 'vendor'), 'is_active', COALESCE(user_is_active, false))
  );

  -- Return the modified event
  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

-- Grant Supabase the permission to call this function (required!)
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;


-- ==============================================================================
-- 4. THE GOOGLE LOGIN WAITING ROOM HOOK
-- ==============================================================================
-- Forces new Google signups into the 'vendor' role and sets their 'is_active' to false
-- This runs BEFORE a user is fully created.

CREATE OR REPLACE FUNCTION public.custom_user_created_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert the new user into YOUR public.users table immediately
  INSERT INTO public.users (id, email, role, fullname, is_active, "createdAt")
  VALUES (
    (event->>'user_id')::uuid,
    event->'user'->>'email',
    'vendor'::"UserRole",
    COALESCE(event->'user'->'user_metadata'->>'full_name', event->'user'->>'email'),
    false, -- The Waiting Room lock
    now()
  );
  
  RETURN event;
END;
$$;

-- Grant Supabase the permission to call this function
GRANT EXECUTE ON FUNCTION public.custom_user_created_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_user_created_hook FROM authenticated, anon, public;


-- ==============================================================================
-- 5. FAST RLS HELPER FUNCTIONS
-- ==============================================================================
-- These functions decode the JWT instantly in memory, avoiding database reads

CREATE OR REPLACE FUNCTION public.user_role() RETURNS text AS $$
  -- Extracts the role from the cryptographically signed JWT, defaults to empty
  SELECT COALESCE(current_setting('request.jwt.claim.app_metadata', true)::jsonb->>'role', '')::text;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;


-- ==============================================================================
-- 6. APPLY RLS POLICIES (POWERED BY JWT CLAIMS)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- A. USERS TABLE
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can read own data" ON public.users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Admins can read all users" ON public.users FOR SELECT USING (public.user_role() IN ('super_admin', 'tenant_admin'));
CREATE POLICY "Super admins can do anything" ON public.users FOR ALL USING (public.user_role() = 'super_admin');
CREATE POLICY "Tenant admins can update users" ON public.users FOR UPDATE USING (public.user_role() = 'tenant_admin');

-- ------------------------------------------------------------------------------
-- B. PROPERTY DRAFTS
-- ------------------------------------------------------------------------------
CREATE POLICY "Vendors and Sales can insert drafts" ON public.property_drafts FOR INSERT WITH CHECK (public.user_role() IN ('vendor', 'salesman') AND vendor_id = auth.uid()::text);
CREATE POLICY "Vendors and Sales can read own drafts" ON public.property_drafts FOR SELECT USING (public.user_role() IN ('vendor', 'salesman') AND vendor_id = auth.uid()::text);
CREATE POLICY "Vendors and Sales can update own pending drafts" ON public.property_drafts FOR UPDATE USING (public.user_role() IN ('vendor', 'salesman') AND vendor_id = auth.uid()::text AND status = 'pending') WITH CHECK (status = 'pending');
CREATE POLICY "Admins can manage all drafts" ON public.property_drafts FOR ALL USING (public.user_role() IN ('super_admin', 'tenant_admin'));

-- ------------------------------------------------------------------------------
-- C. LEADS & SITE VISITS (Sales Workflow)
-- ------------------------------------------------------------------------------
CREATE POLICY "Sales can read own assigned leads" ON public.leads FOR SELECT USING (public.user_role() = 'salesman' AND assigned_to = auth.uid()::text);
CREATE POLICY "Sales can update own leads" ON public.leads FOR UPDATE USING (public.user_role() = 'salesman' AND assigned_to = auth.uid()::text);
CREATE POLICY "Admins can manage leads" ON public.leads FOR ALL USING (public.user_role() IN ('super_admin', 'tenant_admin'));

CREATE POLICY "Sales can manage own site visits" ON public.site_visits FOR ALL USING (public.user_role() = 'salesman' AND user_id = auth.uid()::text);
CREATE POLICY "Admins can manage site visits" ON public.site_visits FOR ALL USING (public.user_role() IN ('super_admin', 'tenant_admin'));

-- ------------------------------------------------------------------------------
-- D. CORE PROJECT INFRASTRUCTURE (Live Data: Projects + related tables)
-- ------------------------------------------------------------------------------
-- Everyone can read live data. Only Admins can edit it.
-- Using a DO block to loop through all the related tables to save typing

DO $$
DECLARE tbl text;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'projects', 'project_units', 'project_specifications',
      'project_amenities', 'project_landmarks', 'project_commercials',
      'project_analysis', 'project_developers', 'project_competitors',
      'location_connectivity'
    ])
  LOOP
    EXECUTE format($f$ CREATE POLICY "Anyone can read live data" ON public.%I FOR SELECT USING (true); $f$, tbl);
    EXECUTE format($f$ CREATE POLICY "Admins can manage live data" ON public.%I FOR ALL USING (public.user_role() IN ('super_admin', 'tenant_admin')); $f$, tbl);
  END LOOP;
END $$;
