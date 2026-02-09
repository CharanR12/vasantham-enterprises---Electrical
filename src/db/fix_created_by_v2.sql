-- 1. Drop the foreign key constraint FIRST
ALTER TABLE referral_sources 
DROP CONSTRAINT IF EXISTS referral_sources_created_by_fkey;

-- 2. Now it is safe to change the column type to text
ALTER TABLE referral_sources 
ALTER COLUMN created_by TYPE text;
