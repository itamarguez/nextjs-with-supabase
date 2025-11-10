-- Admin RLS Policies
-- Allows admin user (specified by ADMIN_EMAIL) to bypass RLS restrictions
-- Run this in Supabase SQL Editor

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Admin email matches ADMIN_EMAIL environment variable
  RETURN (
    SELECT email FROM auth.users
    WHERE id = auth.uid()
    AND email = 'itamar.guez@gmail.com'
  ) IS NOT NULL;
END;
$$;

-- ==============================================
-- USER_PROFILES: Admin can read all profiles
-- ==============================================

DROP POLICY IF EXISTS "Admin can read all profiles" ON user_profiles;

CREATE POLICY "Admin can read all profiles"
ON user_profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR is_admin()
);

DROP POLICY IF EXISTS "Admin can update all profiles" ON user_profiles;

CREATE POLICY "Admin can update all profiles"
ON user_profiles
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id OR is_admin()
)
WITH CHECK (
  auth.uid() = id OR is_admin()
);

-- ==============================================
-- CONVERSATIONS: Admin can read all conversations
-- ==============================================

DROP POLICY IF EXISTS "Admin can read all conversations" ON conversations;

CREATE POLICY "Admin can read all conversations"
ON conversations
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR is_admin()
);

-- ==============================================
-- MESSAGES: Admin can read all messages
-- ==============================================

DROP POLICY IF EXISTS "Admin can read all messages" ON messages;

CREATE POLICY "Admin can read all messages"
ON messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND conversations.user_id = auth.uid()
  ) OR is_admin()
);

-- ==============================================
-- SESSIONS: Admin can read all sessions
-- ==============================================

DROP POLICY IF EXISTS "Admin can read all sessions" ON sessions;

CREATE POLICY "Admin can read all sessions"
ON sessions
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR user_id IS NULL OR is_admin()
);

-- ==============================================
-- PAGE_VIEWS: Admin can read all page views
-- ==============================================

DROP POLICY IF EXISTS "Admin can read all page_views" ON page_views;

CREATE POLICY "Admin can read all page_views"
ON page_views
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR user_id IS NULL OR is_admin()
);

-- ==============================================
-- CONVERSION_EVENTS: Admin can read all events
-- ==============================================

DROP POLICY IF EXISTS "Admin can read all conversion_events" ON conversion_events;

CREATE POLICY "Admin can read all conversion_events"
ON conversion_events
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR user_id IS NULL OR is_admin()
);

-- ==============================================
-- ANONYMOUS_CONVERSATIONS: Admin can read all
-- ==============================================

DROP POLICY IF EXISTS "Admin can read all anonymous_conversations" ON anonymous_conversations;

CREATE POLICY "Admin can read all anonymous_conversations"
ON anonymous_conversations
FOR SELECT
TO authenticated
USING (is_admin());

-- ==============================================
-- ABUSE_LOGS: Admin only
-- ==============================================

DROP POLICY IF EXISTS "Admin can read abuse_logs" ON abuse_logs;

CREATE POLICY "Admin can read abuse_logs"
ON abuse_logs
FOR SELECT
TO authenticated
USING (is_admin());

-- Verify policies were created
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE policyname LIKE '%Admin%'
ORDER BY tablename, policyname;
