-- NoMoreFOMO Database Schema
-- Supabase PostgreSQL Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USER PROFILES & SUBSCRIPTION TIERS
-- ============================================

CREATE TYPE user_tier AS ENUM ('free', 'pro', 'unlimited');

CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  tier user_tier DEFAULT 'free' NOT NULL,

  -- Subscription info
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,

  -- Usage tracking (resets monthly for free tier)
  tokens_used_this_month INTEGER DEFAULT 0,
  requests_this_month INTEGER DEFAULT 0,
  month_reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Lifetime stats
  total_tokens_used BIGINT DEFAULT 0,
  total_requests BIGINT DEFAULT 0,
  total_cost_usd DECIMAL(10, 4) DEFAULT 0,

  -- Abuse prevention
  is_suspended BOOLEAN DEFAULT FALSE,
  suspension_reason TEXT,
  suspicious_activity_count INTEGER DEFAULT 0,
  last_request_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TIER LIMITS CONFIGURATION
-- ============================================

CREATE TABLE tier_limits (
  tier user_tier PRIMARY KEY,

  -- Token limits
  monthly_token_limit INTEGER NOT NULL,
  max_tokens_per_request INTEGER NOT NULL,

  -- Request limits
  requests_per_minute INTEGER NOT NULL,
  requests_per_hour INTEGER NOT NULL,
  requests_per_day INTEGER NOT NULL,

  -- Model access
  allowed_models TEXT[] NOT NULL,
  max_context_window INTEGER NOT NULL,

  -- Features
  can_use_premium_models BOOLEAN DEFAULT FALSE,
  priority_queue BOOLEAN DEFAULT FALSE,

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default tier limits
INSERT INTO tier_limits (tier, monthly_token_limit, max_tokens_per_request, requests_per_minute, requests_per_hour, requests_per_day, allowed_models, max_context_window, can_use_premium_models, priority_queue) VALUES
  ('free', 100000, 2000, 5, 50, 200, ARRAY['gpt-4o-mini', 'gemini-1.5-flash'], 8000, FALSE, FALSE),
  ('pro', 1000000, 8000, 20, 300, 2000, ARRAY['gpt-4o-mini', 'gemini-1.5-flash', 'claude-3-5-haiku'], 32000, TRUE, FALSE),
  ('unlimited', -1, 32000, 60, 2000, 10000, ARRAY['gpt-4o-mini', 'gemini-1.5-flash', 'claude-3-5-haiku', 'gpt-4o', 'claude-3-5-sonnet'], 200000, TRUE, TRUE);

-- ============================================
-- CONVERSATIONS & MESSAGES
-- ============================================

CREATE TABLE conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  title TEXT NOT NULL DEFAULT 'New Conversation',

  -- Hidden from user - for admin analytics
  total_tokens INTEGER DEFAULT 0,
  total_cost_usd DECIMAL(10, 6) DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,

  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,

  -- Model selection info (only for assistant messages)
  model_used TEXT,
  task_category TEXT,
  selection_reason TEXT, -- Why this model was chosen

  -- Hidden analytics
  tokens_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(10, 6) DEFAULT 0,
  latency_ms INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- RATE LIMITING & ABUSE PREVENTION
-- ============================================

CREATE TABLE rate_limit_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Time windows
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  window_type TEXT NOT NULL CHECK (window_type IN ('minute', 'hour', 'day')),

  -- Counts
  request_count INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, window_start, window_type)
);

CREATE TABLE abuse_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  violation_type TEXT NOT NULL, -- 'rate_limit', 'suspicious_pattern', 'token_abuse', etc.
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MODEL ANALYTICS (Admin only)
-- ============================================

CREATE TABLE model_performance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  model_name TEXT NOT NULL,
  task_category TEXT NOT NULL,

  -- Performance metrics
  lmarena_rank INTEGER,
  avg_latency_ms INTEGER,
  success_rate DECIMAL(5, 2),

  -- Cost data (hidden from users)
  cost_per_1k_input_tokens DECIMAL(10, 6),
  cost_per_1k_output_tokens DECIMAL(10, 6),

  -- Context
  max_context_window INTEGER,
  supports_streaming BOOLEAN DEFAULT TRUE,

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(model_name, task_category)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

CREATE INDEX idx_rate_limit_user_window ON rate_limit_tracking(user_id, window_start, window_type);

CREATE INDEX idx_user_profiles_tier ON user_profiles(tier);
CREATE INDEX idx_user_profiles_suspended ON user_profiles(is_suspended);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_tracking ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Reset monthly usage on the first of each month
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE user_profiles
  SET
    tokens_used_this_month = 0,
    requests_this_month = 0,
    month_reset_date = NOW()
  WHERE month_reset_date < DATE_TRUNC('month', NOW());
END;
$$ LANGUAGE plpgsql;

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, tier)
  VALUES (NEW.id, 'free');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();
