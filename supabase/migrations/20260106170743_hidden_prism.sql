/*
  # Add Amount Received Column to Follow-ups

  1. Changes
    - Add `amount_received` boolean column to follow_ups table
    - This field will track whether the sales amount has been received

  2. Security
    - No changes to RLS policies needed
*/

-- Add amount_received column to follow_ups table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'follow_ups' AND column_name = 'amount_received'
  ) THEN
    ALTER TABLE follow_ups ADD COLUMN amount_received boolean DEFAULT false;
  END IF;
END $$;