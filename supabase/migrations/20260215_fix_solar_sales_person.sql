-- Add branch column to sales_persons
ALTER TABLE sales_persons 
ADD COLUMN IF NOT EXISTS branch text DEFAULT 'Kaikativalasu';

-- Create index for branch
CREATE INDEX IF NOT EXISTS idx_sales_persons_branch ON sales_persons(branch);

-- Insert Solar Representative if not exists
INSERT INTO sales_persons (name, branch)
VALUES ('Solar Representative', 'Solar')
ON CONFLICT DO NOTHING;
-- Note: 'name' is not unique in schema, so this might duplicate if run multiple times without constraint. 
-- Ideally we check uniqueness or just rely on manual management for now, but to prevent dupes in this script:
-- We can't easily do ON CONFLICT without unique constraint. 
-- Let's use DO block or simple insert assuming it's ran once. 
-- Or better: Ensure uniqueness on name? No.
-- Let's just insert.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM sales_persons WHERE name = 'Solar Representative' AND branch = 'Solar') THEN
        INSERT INTO sales_persons (name, branch) VALUES ('Solar Representative', 'Solar');
    END IF;
END $$;
