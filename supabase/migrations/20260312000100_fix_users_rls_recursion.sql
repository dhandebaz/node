-- Fix RLS recursion on public.users caused by policies querying public.users

DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;

CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL
  USING (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'superadmin')
  )
  WITH CHECK (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') IN ('admin', 'superadmin')
  );

