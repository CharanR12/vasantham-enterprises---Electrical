-- Create the table if it doesn't exist (idempotent)
CREATE TABLE IF NOT EXISTS referral_sources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE referral_sources ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust as needed for your app's security model)
-- Allow read access to authenticated users
CREATE POLICY "Allow read access for authenticated users" ON referral_sources
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow insert/update/delete for authenticated users (or restrict to admins)
CREATE POLICY "Allow all access for authenticated users" ON referral_sources
  FOR ALL USING (auth.role() = 'authenticated');

-- Seed data (using ON CONFLICT to avoid duplicates)
INSERT INTO referral_sources (name) VALUES
  ('Self Marketing'),
  ('Doors Data'),
  ('Walk-in Customer'),
  ('Collection'),
  ('Build Expo 2024'),
  ('Build Expo 2025')
ON CONFLICT (name) DO NOTHING;
