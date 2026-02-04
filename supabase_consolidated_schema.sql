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
ON CONFLICT DO NOTHING;/*
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
  WITH CHECK (true);/*
  # Add Authentication Users

  1. New Tables
    - Create auth users for the application
    
  2. Security
    - Insert demo user for testing
    - Users will be managed through Supabase Auth
*/

-- Insert a demo user for testing
-- Note: In production, users should be created through Supabase Auth UI or API
-- This is just for demo purposes

-- The user will be created through Supabase Auth, but we can set up the demo credentials
-- Email: admin@vasantham.com
-- Password: admin123

-- Note: You'll need to create this user through the Supabase dashboard or auth API
-- This migration just documents the expected demo user/*
  # Add Last Contacted Date to Customers

  1. Changes
    - Add `last_contacted_date` column to customers table
    - This field will be manually set by users to track when they last contacted the customer

  2. Security
    - No changes to RLS policies needed
*/

-- Add last_contacted_date column to customers table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'last_contacted_date'
  ) THEN
    ALTER TABLE customers ADD COLUMN last_contacted_date date;
  END IF;
END $$;/*
  # Inventory Tracker Database Schema

  1. New Tables
    - `brands`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)
    
    - `products`
      - `id` (uuid, primary key)
      - `brand_id` (uuid, foreign key)
      - `product_name` (text)
      - `model_number` (text)
      - `quantity_available` (integer)
      - `arrival_date` (date)
      - `created_at` (timestamp)
    
    - `sale_entries`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key)
      - `sale_date` (date)
      - `customer_name` (text)
      - `bill_number` (text, optional)
      - `quantity_sold` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (matching existing pattern)
*/

-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid REFERENCES brands(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  model_number text NOT NULL,
  quantity_available integer NOT NULL DEFAULT 0,
  arrival_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create sale_entries table
CREATE TABLE IF NOT EXISTS sale_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  sale_date date NOT NULL,
  customer_name text NOT NULL,
  bill_number text,
  quantity_sold integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (matching existing pattern)
CREATE POLICY "Allow all operations for public users"
  ON brands
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for public users"
  ON products
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for public users"
  ON sale_entries
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Insert some default brands
INSERT INTO brands (name) VALUES 
  ('Samsung'),
  ('Apple'),
  ('Sony'),
  ('LG'),
  ('Panasonic'),
  ('Philips')
ON CONFLICT (name) DO NOTHING;/*
  # Add Sales Amount to Follow-ups

  1. Changes
    - Add `sales_amount` column to follow_ups table
    - This field will store the sales amount when status is 'Sales completed'

  2. Security
    - No changes to RLS policies needed
*/

-- Add sales_amount column to follow_ups table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'follow_ups' AND column_name = 'sales_amount'
  ) THEN
    ALTER TABLE follow_ups ADD COLUMN sales_amount decimal(10,2) DEFAULT 0;
  END IF;
END $$;/*
  # Add Amount Received Column to Follow-ups

  1. Changes
    - Add `amount_received` boolean column to follow_ups table
    - This field will track whether the sales amount has been received

  2. Security
    - No changes to RLS policies needed
*/

-- Add amount_received column to follow_ups table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'follow_ups' AND column_name = 'amount_received'
  ) THEN
    ALTER TABLE follow_ups ADD COLUMN amount_received boolean DEFAULT false;
  END IF;
END $$;