-- Upgrade your test account to PRO tier
-- Run this in Supabase SQL Editor to test Claude models

UPDATE user_profiles
SET tier = 'pro'
WHERE id IN (
  SELECT id FROM auth.users
  ORDER BY created_at DESC
  LIMIT 1
);

-- Verify the upgrade
SELECT
  u.email,
  p.tier,
  p.tokens_used_this_month,
  p.total_cost_usd
FROM auth.users u
JOIN user_profiles p ON u.id = p.id;
