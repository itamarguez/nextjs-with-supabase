-- Manual fix: Set your tier to unlimited
-- Run this ONLY if you confirmed you're on 'pro' but paid for 'unlimited'

UPDATE user_profiles
SET tier = 'unlimited'
WHERE id = auth.uid();

-- Then refresh your browser and you should see "Unlimited" in the header
