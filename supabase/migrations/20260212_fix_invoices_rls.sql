-- Fix RLS policies to allow authenticated users (staff) to manage invoices and inventory
-- Drop existing restrictive policies first to ensure clean slate

-- Invoices
DROP POLICY IF EXISTS "Allow all operations for public users" ON invoices;
DROP POLICY IF EXISTS "Enable read access for all users" ON invoices;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON invoices;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON invoices;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON invoices;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON invoices;

-- Invoices: READ (All authenticated)
CREATE POLICY "Allow read for authenticated users"
  ON invoices FOR SELECT
  TO authenticated
  USING (true);

-- Invoices: INSERT (All authenticated)
CREATE POLICY "Allow insert for authenticated users"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Invoices: UPDATE (All authenticated)
CREATE POLICY "Allow update for authenticated users"
  ON invoices FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Invoices: DELETE (ADMIN ONLY)
-- This prevents regular users from deleting the quotation itself
CREATE POLICY "Allow delete for admins only"
  ON invoices FOR DELETE
  TO authenticated
  USING (
    (auth.jwt() ->> 'org_role') = 'org:admin' 
    OR 
    (auth.jwt() ->> 'role') = 'org:admin'
    OR
    EXISTS (
        SELECT 1 FROM sales_persons sp 
        WHERE sp.id::text = auth.uid()::text 
        AND sp.name = 'Admin' -- Fallback if role not in JWT
    )
  );

-- Invoice Items
DROP POLICY IF EXISTS "Allow all operations for public users" ON invoice_items;
DROP POLICY IF EXISTS "Enable read access for all users" ON invoice_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON invoice_items;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON invoice_items;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON invoice_items;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON invoice_items;

-- Invoice Items: ALL Operations (Authenticated)
-- Users need DELETE permission here because updating an invoice involves
-- deleting and re-inserting items.
CREATE POLICY "Allow all operations for authenticated users"
  ON invoice_items
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Products (Need update permission for stock management)
DROP POLICY IF EXISTS "Allow all operations for public users" ON products;
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON products;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON products;

CREATE POLICY "Allow all operations for authenticated users"
  ON products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Brands
DROP POLICY IF EXISTS "Allow all operations for public users" ON brands;
DROP POLICY IF EXISTS "Enable read access for all users" ON brands;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON brands;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON brands;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON brands;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON brands;

CREATE POLICY "Allow all operations for authenticated users"
  ON brands
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Sale Entries
DROP POLICY IF EXISTS "Allow all operations for public users" ON sale_entries;
DROP POLICY IF EXISTS "Enable read access for all users" ON sale_entries;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON sale_entries;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON sale_entries;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON sale_entries;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON sale_entries;

CREATE POLICY "Allow all operations for authenticated users"
  ON sale_entries
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

