/*
  # Invoices Database Schema

  1. New Tables
    - `invoices`
      - `id` (uuid, primary key)
      - `invoice_number` (text, unique, auto-generated)
      - `customer_name` (text, optional)
      - `company_name` (text, optional)
      - `total_amount` (numeric)
      - `created_at` (timestamp)
    
    - `invoice_items`
      - `id` (uuid, primary key)
      - `invoice_id` (uuid, foreign key)
      - `product_id` (uuid, reference only - no cascade)
      - `product_name` (text, snapshot)
      - `model_number` (text, snapshot)
      - `brand_name` (text, snapshot)
      - `mrp` (numeric)
      - `sale_price` (numeric)
      - `quantity` (integer)
      - `line_total` (numeric)
      - `sort_order` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access
*/

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  customer_name text,
  company_name text,
  total_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  -- At least one of customer_name or company_name required
  CONSTRAINT customer_or_company CHECK (customer_name IS NOT NULL OR company_name IS NOT NULL)
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  product_id uuid, -- Reference only, no cascade (product may be deleted later)
  product_name text NOT NULL,
  model_number text NOT NULL,
  brand_name text NOT NULL,
  mrp numeric NOT NULL DEFAULT 0,
  sale_price numeric NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  line_total numeric NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow all operations for public users"
  ON invoices
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all operations for public users"
  ON invoice_items
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);
