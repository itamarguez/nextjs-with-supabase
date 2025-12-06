-- Check what tier you're actually on
-- Run this in Supabase SQL Editor

SELECT
  id,
  tier,
  stripe_subscription_id,
  subscription_start_date,
  subscription_end_date,
  created_at
FROM user_profiles
ORDER BY created_at DESC
LIMIT 5;

-- This will show your recent users and their current tiers
