-- Change created_by column to text to support Clerk user IDs
ALTER TABLE referral_sources 
ALTER COLUMN created_by TYPE text;

-- Drop the foreign key constraint if it exists (since we can't enforce FK against Supabase auth.users with Clerk IDs easily, or if we want to store Clerk IDs directly)
ALTER TABLE referral_sources 
DROP CONSTRAINT IF EXISTS referral_sources_created_by_fkey;
