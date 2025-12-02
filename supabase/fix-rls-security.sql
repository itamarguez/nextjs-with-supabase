-- Fix Supabase Security Advisor Issues
-- Enable RLS on all public tables and ensure proper policies

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

-- Tables with existing policies (just need RLS enabled)
ALTER TABLE public.abuse_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Tables without policies (need RLS enabled + basic policies)
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tier_limits ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ADD MISSING POLICIES
-- ============================================================================

-- page_views: System can write, admins can read
CREATE POLICY "Service role can insert page views"
  ON public.page_views
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Admins can read page views"
  ON public.page_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.tier = 'admin'
    )
  );

-- tier_limits: Everyone can read (reference data), only system can modify
CREATE POLICY "Anyone can read tier limits"
  ON public.tier_limits
  FOR SELECT
  USING (true);

CREATE POLICY "Only service role can modify tier limits"
  ON public.tier_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- rate_limit_tracking: System can manage, users can read their own
CREATE POLICY "Users can read their own rate limits"
  ON public.rate_limit_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage rate limits"
  ON public.rate_limit_tracking
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- FIX FUNCTION SECURITY: Set immutable search_path
-- ============================================================================
-- This prevents search_path hijacking attacks

ALTER FUNCTION public.get_current_month_start() SET search_path = public;
ALTER FUNCTION public.get_or_create_model_token_usage(UUID, TEXT) SET search_path = public;
ALTER FUNCTION public.update_model_token_usage(UUID, TEXT, INTEGER, INTEGER, NUMERIC) SET search_path = public;
ALTER FUNCTION public.reset_monthly_usage() SET search_path = public;
ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.create_user_profile() SET search_path = public;

-- ============================================================================
-- VERIFY ALL SECURITY FIXES
-- ============================================================================

-- Check that RLS is enabled on all public tables
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
ORDER BY tablename;

-- Show all RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

SELECT '✅ All security fixes applied successfully!' as status;
SELECT 'ℹ️  Manual step: Enable HaveIBeenPwned password protection in Auth settings' as reminder;
