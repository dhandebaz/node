CREATE TABLE IF NOT EXISTS task_checklists (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  task_id text NOT NULL,
  title text NOT NULL,
  is_completed boolean DEFAULT false,
  photo_proof_url text,
  created_at timestamp with time zone DEFAULT now()
);
