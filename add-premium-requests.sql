-- Add Premium Request Tracking for Hybrid Model
-- Run this in Supabase SQL Editor

-- Add premium_requests_this_month column to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS premium_requests_this_month INTEGER DEFAULT 0;

-- Update the monthly reset function to include premium requests
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET
    tokens_used_this_month = 0,
    requests_this_month = 0,
    premium_requests_this_month = 0,
    month_reset_date = NOW()
  WHERE month_reset_date < DATE_TRUNC('month', NOW());
END;
$$ LANGUAGE plpgsql;

-- Update tier limits to include premium request limits
ALTER TABLE tier_limits
ADD COLUMN IF NOT EXISTS premium_requests_per_month INTEGER DEFAULT 0;

-- Set premium request limits for each tier
UPDATE tier_limits SET premium_requests_per_month = 10 WHERE tier = 'free';
UPDATE tier_limits SET premium_requests_per_month = 200 WHERE tier = 'pro';
UPDATE tier_limits SET premium_requests_per_month = -1 WHERE tier = 'unlimited'; -- unlimited

-- Verify the changes
SELECT tier, premium_requests_per_month, allowed_models
FROM tier_limits
ORDER BY tier;
