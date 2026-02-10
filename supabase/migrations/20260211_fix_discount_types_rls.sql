-- Fix RLS policies for discount_types table
-- Drop restrictive policies that use auth.role() (incompatible with Clerk auth)
DROP POLICY IF EXISTS "Enable read access for all users" ON discount_types;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON discount_types;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON discount_types;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON discount_types;

-- Create permissive policies matching the pattern used by brands, products, invoices
CREATE POLICY "Allow all operations for public users"
    ON discount_types
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);
