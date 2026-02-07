
-- Add updated_at column to products table
ALTER TABLE products 
ADD COLUMN updated_at timestamptz DEFAULT now();

-- Update existing records to have updated_at same as created_at
UPDATE products SET updated_at = created_at WHERE updated_at IS NULL;
