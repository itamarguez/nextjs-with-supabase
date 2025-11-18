-- Diagnostic Query: Check for Orphaned Auth Users
-- These are users who created accounts but don't have profiles
-- This could explain why beta testers aren't showing up in admin dashboard

-- ============================================
-- QUERY 1: Find orphaned auth users (no profile)
-- ============================================
SELECT
  au.id,
  au.email,
  au.created_at as "signup_date",
  au.last_sign_in_at as "last_login",
  au.raw_app_meta_data->>'provider' as "signup_method"
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL
ORDER BY au.created_at DESC;

-- This will show you all users who tried to sign up but don't have profiles (likely your friends!)


-- ============================================
-- QUERY 2: Count orphaned users by signup method
-- ============================================
SELECT
  au.raw_app_meta_data->>'provider' as "signup_method",
  COUNT(*) as "orphaned_count"
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL
GROUP BY au.raw_app_meta_data->>'provider';


-- ============================================
-- QUERY 3: Compare total auth users vs profiles
-- ============================================
SELECT
  (SELECT COUNT(*) FROM auth.users) as "total_auth_users",
  (SELECT COUNT(*) FROM public.user_profiles) as "total_profiles",
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN public.user_profiles up ON au.id = up.id WHERE up.id IS NULL) as "orphaned_users";


-- ============================================
-- FIX: If you want to create profiles for orphaned users
-- ============================================
-- ONLY RUN THIS IF YOU SEE ORPHANED USERS AND WANT TO FIX THEM
-- This will create profiles for all orphaned users

/*
INSERT INTO public.user_profiles (
  id,
  tier,
  tokens_used_this_month,
  total_tokens_used,
  total_cost_usd,
  suspicious_activity_count,
  is_suspended,
  premium_requests_this_month
)
SELECT
  au.id,
  'free'::user_tier,
  0,
  0,
  0.0,
  0,
  false,
  0
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;
*/


-- ============================================
-- VERIFICATION: Check that trigger is working
-- ============================================
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- If this returns empty, the trigger is not installed!
-- Run create-user-profile-trigger.sql first
