/*
  # Add Last Contacted Date to Customers

  1. Changes
    - Add `last_contacted_date` column to customers table
    - This field will be manually set by users to track when they last contacted the customer

  2. Security
    - No changes to RLS policies needed
*/

-- Add last_contacted_date column to customers table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'last_contacted_date'
  ) THEN
    ALTER TABLE customers ADD COLUMN last_contacted_date date;
  END IF;
END $$;