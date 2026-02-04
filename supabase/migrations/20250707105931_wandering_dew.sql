/*
  # Add Sales Amount to Follow-ups

  1. Changes
    - Add `sales_amount` column to follow_ups table
    - This field will store the sales amount when status is 'Sales completed'

  2. Security
    - No changes to RLS policies needed
*/

-- Add sales_amount column to follow_ups table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'follow_ups' AND column_name = 'sales_amount'
  ) THEN
    ALTER TABLE follow_ups ADD COLUMN sales_amount decimal(10,2) DEFAULT 0;
  END IF;
END $$;