-- Remove purchase_rate column from products table as it is replaced by purchase_discounted_price (Net Rate) logic
-- and the old "Basic Rate" concept is no longer used in the new MRP -> Disc -> Rate flow.

ALTER TABLE products DROP COLUMN IF EXISTS purchase_rate;
