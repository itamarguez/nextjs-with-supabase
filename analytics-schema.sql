-- Advanced Analytics Schema
-- Track page views, sessions, and conversion funnels

-- ============================================
-- PAGE VIEWS
-- ============================================

CREATE TABLE page_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- User identification
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL for anonymous
  session_id TEXT NOT NULL, -- Ties anonymous and authenticated visits together

  -- Page info
  page_path TEXT NOT NULL, -- e.g., "/", "/chat", "/auth/sign-up"
  page_title TEXT, -- e.g., "NoMoreFOMO - Landing Page"

  -- Navigation context
  referrer TEXT, -- Previous page URL
  is_first_visit BOOLEAN DEFAULT FALSE, -- First page of the session

  -- User context (duplicated from messages for performance)
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  country_code TEXT,

  -- Timing
  time_on_page_ms INTEGER, -- How long they stayed (calculated on next page view or session end)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SESSIONS
-- ============================================

CREATE TABLE sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- User identification
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL for anonymous
  session_id TEXT UNIQUE NOT NULL,

  -- Session context
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER, -- Total session duration

  -- Activity
  page_views_count INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,

  -- Entry/Exit
  entry_page TEXT, -- First page visited
  exit_page TEXT, -- Last page before leaving

  -- Conversion tracking
  is_trial_user BOOLEAN DEFAULT FALSE, -- Started as anonymous
  did_sign_up BOOLEAN DEFAULT FALSE, -- Converted to registered user
  did_send_message BOOLEAN DEFAULT FALSE, -- Engaged with chat

  -- User context
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  country_code TEXT,

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CONVERSION EVENTS
-- ============================================

CREATE TABLE conversion_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- User identification
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,

  -- Event info
  event_name TEXT NOT NULL, -- 'trial_started', 'trial_limit_reached', 'signup_clicked', 'signup_completed', 'first_message_sent', etc.
  event_category TEXT NOT NULL, -- 'trial', 'signup', 'engagement', 'conversion'

  -- Event context
  page_path TEXT,
  metadata JSONB, -- Additional event-specific data

  -- Timing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- OUTBOUND CLICKS
-- ============================================

CREATE TABLE outbound_clicks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- User identification
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,

  -- Click info
  link_url TEXT NOT NULL, -- Where they went
  link_text TEXT, -- What the link said
  page_path TEXT, -- Which page they were on

  -- Context
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Page views
CREATE INDEX idx_page_views_session ON page_views(session_id);
CREATE INDEX idx_page_views_user ON page_views(user_id);
CREATE INDEX idx_page_views_path ON page_views(page_path);
CREATE INDEX idx_page_views_created ON page_views(created_at DESC);

-- Sessions
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_session_id ON sessions(session_id);
CREATE INDEX idx_sessions_started ON sessions(started_at DESC);
CREATE INDEX idx_sessions_conversion ON sessions(did_sign_up, did_send_message);

-- Conversion events
CREATE INDEX idx_events_session ON conversion_events(session_id);
CREATE INDEX idx_events_name ON conversion_events(event_name);
CREATE INDEX idx_events_category ON conversion_events(event_category);
CREATE INDEX idx_events_created ON conversion_events(created_at DESC);

-- Outbound clicks
CREATE INDEX idx_outbound_session ON outbound_clicks(session_id);
CREATE INDEX idx_outbound_url ON outbound_clicks(link_url);
CREATE INDEX idx_outbound_created ON outbound_clicks(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- No RLS - all analytics tables are server-side only
-- Users never query these directly via Supabase client

COMMENT ON TABLE page_views IS 'Tracks every page view for user journey analysis';
COMMENT ON TABLE sessions IS 'Aggregated session data for analytics and conversion tracking';
COMMENT ON TABLE conversion_events IS 'Key user actions for funnel analysis';
COMMENT ON TABLE outbound_clicks IS 'Tracks clicks on external links';
