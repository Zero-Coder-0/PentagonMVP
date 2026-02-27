-- 1. ADD 'is_active' COLUMN TO EXISTING USERS TABLE
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;

-- 2. UPDATE THE ADMIN MAGIC LINK RPC
-- Now strictly checks that the Admin is legally "active" before sending OTP
CREATE OR REPLACE FUNCTION check_is_admin_email(check_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT CASE WHEN role::text IN ('super_admin', 'tenant_admin') AND is_active = true THEN TRUE ELSE FALSE END INTO is_admin
  FROM public.users
  WHERE email = check_email;

  RETURN COALESCE(is_admin, FALSE);
END;
$$;
GRANT EXECUTE ON FUNCTION check_is_admin_email(TEXT) TO anon, authenticated;

-- 3. AUTOMATE GOOGLE LOGIN TO PUBLIC.USERS
-- Automatically locks new Google users as 'vendor' with is_active = false
CREATE OR REPLACE FUNCTION public.handle_new_google_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, role, "fullName", is_active, "createdAt", "updatedAt")
  VALUES (
    new.id,
    new.email,
    'vendor',
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    false, -- The Waiting Room lock
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop any previous trigger if we accidentally made one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the strict trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_google_user();
