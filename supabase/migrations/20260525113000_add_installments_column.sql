-- Migration: Add installments column to follow_ups table
-- Description: Adds installments JSONB column to track history of partial payments.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'follow_ups' AND column_name = 'installments'
  ) THEN
    ALTER TABLE follow_ups ADD COLUMN installments jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;
