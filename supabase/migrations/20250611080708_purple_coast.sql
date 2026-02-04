/*
  # Fix RLS Policies for Mock Authentication

  1. Changes
    - Update RLS policies for all tables to allow public access
    - This enables the application to work with mock authentication
    - Note: For production, implement proper Supabase authentication

  2. Security
    - Temporarily allow public access to all tables
    - This is a development-only solution
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON sales_persons;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON customers;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON follow_ups;

-- Create new policies for public access
CREATE POLICY "Allow all operations for public users"
  ON sales_persons
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for public users"
  ON customers
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for public users"
  ON follow_ups
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);