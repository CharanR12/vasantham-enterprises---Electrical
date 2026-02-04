/*
  # Sales Follow-Up Tracker Database Schema

  1. New Tables
    - `sales_persons`
      - `id` (uuid, primary key)
      - `name` (text)
      - `created_at` (timestamp)
    
    - `customers`
      - `id` (uuid, primary key)
      - `name` (text)
      - `mobile` (text)
      - `location` (text)
      - `referral_source` (text)
      - `sales_person_id` (uuid, foreign key)
      - `remarks` (text)
      - `created_at` (timestamp)
    
    - `follow_ups`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key)
      - `date` (date)
      - `status` (text)
      - `remarks` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their data
*/

-- Create sales_persons table
CREATE TABLE IF NOT EXISTS sales_persons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  mobile text NOT NULL,
  location text NOT NULL,
  referral_source text NOT NULL DEFAULT 'Self Marketing',
  sales_person_id uuid REFERENCES sales_persons(id) ON DELETE SET NULL,
  remarks text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create follow_ups table
CREATE TABLE IF NOT EXISTS follow_ups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL DEFAULT 'Not yet contacted',
  remarks text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE sales_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;

-- Create policies for sales_persons
CREATE POLICY "Allow all operations for authenticated users"
  ON sales_persons
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for customers
CREATE POLICY "Allow all operations for authenticated users"
  ON customers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for follow_ups
CREATE POLICY "Allow all operations for authenticated users"
  ON follow_ups
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default sales persons
INSERT INTO sales_persons (name) VALUES 
  ('Rajesh Kumar'),
  ('Priya Sharma'),
  ('Amit Patel'),
  ('Deepa Singh')
ON CONFLICT DO NOTHING;