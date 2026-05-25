-- Migration: Add payment tracking columns to follow_ups table
-- Description: Adds bill_no, bill_amount, amount_given, and balance_amount to track payments on completed sales.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'follow_ups' AND column_name = 'bill_no'
  ) THEN
    ALTER TABLE follow_ups ADD COLUMN bill_no text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'follow_ups' AND column_name = 'bill_amount'
  ) THEN
    ALTER TABLE follow_ups ADD COLUMN bill_amount decimal(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'follow_ups' AND column_name = 'amount_given'
  ) THEN
    ALTER TABLE follow_ups ADD COLUMN amount_given decimal(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'follow_ups' AND column_name = 'balance_amount'
  ) THEN
    ALTER TABLE follow_ups ADD COLUMN balance_amount decimal(10,2) DEFAULT 0;
  END IF;
END $$;
