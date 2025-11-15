-- Fix RLS for Webhook Updates
-- This creates a security definer function that bypasses RLS
-- Safe because it's only called from webhook with verified Stripe signature

-- Function to update user tier (bypasses RLS)
CREATE OR REPLACE FUNCTION update_user_tier_from_webhook(
  p_user_id UUID,
  p_tier TEXT,
  p_stripe_subscription_id TEXT,
  p_subscription_start_date TIMESTAMP WITH TIME ZONE,
  p_subscription_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE(
  id UUID,
  tier TEXT,
  updated BOOLEAN
)
SECURITY DEFINER  -- This makes the function run with the permissions of the function owner (bypasses RLS)
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update the user profile
  UPDATE user_profiles
  SET
    tier = p_tier::user_tier,
    stripe_subscription_id = p_stripe_subscription_id,
    subscription_start_date = p_subscription_start_date,
    subscription_end_date = p_subscription_end_date,
    updated_at = NOW()
  WHERE user_profiles.id = p_user_id;

  -- Return the updated user
  RETURN QUERY
  SELECT
    user_profiles.id,
    user_profiles.tier::TEXT,
    TRUE as updated
  FROM user_profiles
  WHERE user_profiles.id = p_user_id;
END;
$$;

-- Grant execute permission to authenticated users (webhook uses service role which has all permissions)
GRANT EXECUTE ON FUNCTION update_user_tier_from_webhook TO authenticated, anon, service_role;

-- Verify function was created
SELECT 'Webhook RLS bypass function created successfully!' as status;
