-- Add new price and discount fields to products table
ALTER TABLE products 
ADD COLUMN mrp numeric DEFAULT 0,
ADD COLUMN purchase_rate numeric DEFAULT 0,
ADD COLUMN purchase_discount_percent numeric DEFAULT 0,
ADD COLUMN purchase_discounted_price numeric DEFAULT 0,
ADD COLUMN sale_price numeric DEFAULT 0,
ADD COLUMN sale_discount_percent numeric DEFAULT 0,
ADD COLUMN sale_discount_amount numeric DEFAULT 0;
