-- Debug: Why isn't the tier updating?
-- Run each query separately and tell me the results

-- Query 1: Check if you're logged in
SELECT auth.uid() as my_user_id;
-- If this returns NULL, you're not logged in to Supabase

-- Query 2: Find your user profile by email
-- Replace 'your-email@example.com' with your actual email
SELECT id, tier, stripe_subscription_id
FROM user_profiles
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email = 'your-email@example.com'
);
-- This will show your actual tier in the database

-- Query 3: Update tier using the specific user ID
-- Copy the 'id' from Query 2 and paste it below
UPDATE user_profiles
SET tier = 'unlimited'
WHERE id = 'paste-your-user-id-here';
-- Replace 'paste-your-user-id-here' with the actual UUID from Query 2

-- Query 4: Verify the update worked
SELECT id, tier FROM user_profiles
WHERE id = 'paste-your-user-id-here';
