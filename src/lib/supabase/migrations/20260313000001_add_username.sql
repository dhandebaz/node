-- Add username to tenants
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS username TEXT;

-- Add unique constraint
DO $$ BEGIN
    ALTER TABLE public.tenants ADD CONSTRAINT tenants_username_unique UNIQUE (username);
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN others THEN null; -- constraint might already exist
END $$;
