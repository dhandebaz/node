-- Fix users table schema to support OAuth and Auth Trigger
-- 1. Make phone nullable (OAuth users might not have phone)
ALTER TABLE public.users ALTER COLUMN phone DROP NOT NULL;

-- 2. Add missing columns expected by the auth trigger
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email text UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url text;

-- 3. Update the handle_new_user function to include phone mapping if available
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, phone, full_name, avatar_url, role, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    new.phone, -- Map phone from auth.users if available
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'role', 'customer'),
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    phone = COALESCE(EXCLUDED.phone, public.users.phone),
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
    updated_at = now();
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
