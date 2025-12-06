-- Debug: Check your current tier
-- Run this in Supabase SQL Editor

-- 1. Check your current tier
SELECT
  id,
  tier,
  stripe_customer_id,
  stripe_subscription_id,
  subscription_start_date,
  subscription_end_date
FROM user_profiles
WHERE id = auth.uid();

-- Expected: tier should be 'unlimited' if you paid $49
-- If it shows 'pro', that's the bug we need to fix

-- 2. If you need to manually fix it to unlimited:
-- UPDATE user_profiles
-- SET tier = 'unlimited'
-- WHERE id = auth.uid();

-- (Uncomment the UPDATE above and run it if needed)
