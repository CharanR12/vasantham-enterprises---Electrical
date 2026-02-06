-- Add status to invoices
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'Unpaid';

-- Add discount and snapshot fields to invoice_items
ALTER TABLE invoice_items 
ADD COLUMN IF NOT EXISTS discount numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS purchase_rate numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS purchase_discount_percent numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS purchase_discounted_price numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS sale_discount_percent numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS sale_discount_amount numeric NOT NULL DEFAULT 0;
