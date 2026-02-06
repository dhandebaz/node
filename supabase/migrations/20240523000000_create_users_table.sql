-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  phone text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('customer', 'investor', 'admin', 'superadmin')) DEFAULT 'customer',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Create policy to allow service role to do everything
CREATE POLICY "Service role can do everything" ON public.users
  FOR ALL
  USING (true)
  WITH CHECK (true);
