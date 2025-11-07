-- Anonymous Conversations Table
-- Stores chat data from users who haven't signed up yet
-- Can be linked to a user account after signup via session_id

CREATE TABLE anonymous_conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- Session tracking
  session_id TEXT NOT NULL, -- Cookie-based session identifier

  -- Conversation data
  user_prompt TEXT NOT NULL,
  assistant_response TEXT NOT NULL,

  -- Model info
  model_used TEXT NOT NULL,
  task_category TEXT,
  selection_reason TEXT,

  -- Analytics (hidden from users)
  tokens_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(10, 6) DEFAULT 0,
  latency_ms INTEGER,

  -- Abuse tracking
  ip_address TEXT,
  user_agent TEXT,

  -- User linking (if they sign up later)
  claimed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_anonymous_session_id ON anonymous_conversations(session_id);
CREATE INDEX idx_anonymous_created_at ON anonymous_conversations(created_at DESC);
CREATE INDEX idx_anonymous_claimed_by ON anonymous_conversations(claimed_by_user_id);
CREATE INDEX idx_anonymous_ip_address ON anonymous_conversations(ip_address);

-- No RLS needed - this table is only accessed by server-side code
-- Never exposed to client via Supabase client library

COMMENT ON TABLE anonymous_conversations IS 'Stores conversations from non-authenticated trial users for analytics and potential user linking after signup';
COMMENT ON COLUMN anonymous_conversations.session_id IS 'Cookie-based identifier to group conversations from same anonymous user';
COMMENT ON COLUMN anonymous_conversations.claimed_by_user_id IS 'Set when user signs up, allowing us to show their trial conversations in their account';
