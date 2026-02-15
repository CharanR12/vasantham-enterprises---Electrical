-- Add branch column to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS branch text DEFAULT 'Kaikativalasu';

-- Add branch column to sale_entries table
ALTER TABLE sale_entries 
ADD COLUMN IF NOT EXISTS branch text DEFAULT 'Kaikativalasu';

-- Add branch column to invoices table
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS branch text DEFAULT 'Kaikativalasu';

-- Add branch column to referral_sources table
ALTER TABLE referral_sources 
ADD COLUMN IF NOT EXISTS branch text DEFAULT 'Kaikativalasu';

-- Add index for better performance on branch filtering
CREATE INDEX IF NOT EXISTS idx_customers_branch ON customers(branch);
CREATE INDEX IF NOT EXISTS idx_sale_entries_branch ON sale_entries(branch);
CREATE INDEX IF NOT EXISTS idx_invoices_branch ON invoices(branch);
CREATE INDEX IF NOT EXISTS idx_referral_sources_branch ON referral_sources(branch);

-- Optional: Update RLS policies if needed. 
-- For now, we rely on application-level filtering via the 'branch' column 
-- and the fact that 'solar_user' will only send queries with 'branch = Solar'.
-- Admins can access all, but UI will filter.

-- Comment: Existing data defaults to 'Kaikativalasu', preserving current behavior.
