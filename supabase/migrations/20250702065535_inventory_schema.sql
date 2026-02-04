/*
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
ON CONFLICT (name) DO NOTHING;