-- Fix: Create user profile for existing users
-- Run this in Supabase SQL Editor

-- Create profiles for any existing users that don't have one
INSERT INTO user_profiles (id, tier)
SELECT id, 'free'
FROM auth.users
WHERE id NOT IN (SELECT id FROM user_profiles);

-- Verify it worked
SELECT
  u.email,
  p.tier,
  p.tokens_used_this_month,
  p.created_at
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id;
