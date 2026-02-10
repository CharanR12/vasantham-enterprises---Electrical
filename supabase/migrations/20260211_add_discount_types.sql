-- Create discount_types table
CREATE TABLE IF NOT EXISTS discount_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add sales_discounts column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sales_discounts JSONB DEFAULT '{}'::jsonb;

-- Add RLS policies for discount_types if needed (assuming public/authenticated access for now similar to brands)
ALTER TABLE discount_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON discount_types
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON discount_types
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON discount_types
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON discount_types
    FOR DELETE USING (auth.role() = 'authenticated');
