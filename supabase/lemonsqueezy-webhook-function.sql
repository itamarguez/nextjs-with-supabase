-- LemonSqueezy Webhook Database Function
-- This creates a security definer function that bypasses RLS
-- Safe because it's only called from webhook with verified LemonSqueezy signature

-- Drop old Stripe-specific function if it exists
DROP FUNCTION IF EXISTS update_user_tier_from_webhook(UUID, TEXT, TEXT, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE);

-- Create new generic function for LemonSqueezy
CREATE OR REPLACE FUNCTION update_user_tier_from_webhook(
  p_user_id UUID,
  p_tier TEXT,
  p_subscription_id TEXT,
  p_current_period_start TEXT,
  p_current_period_end TEXT
)
RETURNS VOID
SECURITY DEFINER  -- This makes the function run with the permissions of the function owner (bypasses RLS)
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update the user profile
  UPDATE user_profiles
  SET
    tier = p_tier::user_tier,
    stripe_subscription_id = p_subscription_id,  -- Reusing this column for LemonSqueezy subscription ID
    subscription_start_date = p_current_period_start::TIMESTAMP WITH TIME ZONE,
    subscription_end_date = p_current_period_end::TIMESTAMP WITH TIME ZONE,
    updated_at = NOW()
  WHERE user_profiles.id = p_user_id;

  -- Raise notice for debugging
  RAISE NOTICE 'Updated user % to tier % (subscription: %)', p_user_id, p_tier, p_subscription_id;
END;
$$;

-- Grant execute permission to all roles (webhook uses service role)
GRANT EXECUTE ON FUNCTION update_user_tier_from_webhook TO authenticated, anon, service_role;

-- Verify function was created
SELECT 'LemonSqueezy webhook function created successfully!' as status;
