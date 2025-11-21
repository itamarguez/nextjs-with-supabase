-- Add per-model token tracking for expensive models (like o1)
-- This enables monthly token caps for specific models

-- Create model_token_usage table
CREATE TABLE IF NOT EXISTS model_token_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_name TEXT NOT NULL,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  month_start DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one row per user per model per month
  UNIQUE(user_id, model_name, month_start)
);

-- Add RLS policies
ALTER TABLE model_token_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own token usage
CREATE POLICY "Users can view their own model token usage"
  ON model_token_usage
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert/update (for API)
CREATE POLICY "Service role can manage model token usage"
  ON model_token_usage
  FOR ALL
  USING (true);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_model_token_usage_user_model_month
  ON model_token_usage(user_id, model_name, month_start);

-- Function to get current month start
CREATE OR REPLACE FUNCTION get_current_month_start()
RETURNS DATE AS $$
BEGIN
  RETURN DATE_TRUNC('month', NOW())::DATE;
END;
$$ LANGUAGE plpgsql;

-- Function to get or create model token tracking record
CREATE OR REPLACE FUNCTION get_or_create_model_token_usage(
  p_user_id UUID,
  p_model_name TEXT
)
RETURNS TABLE (
  id UUID,
  tokens_used INTEGER,
  month_start DATE
) AS $$
DECLARE
  v_month_start DATE;
  v_record RECORD;
BEGIN
  v_month_start := get_current_month_start();

  -- Try to get existing record
  SELECT mtu.id, mtu.tokens_used, mtu.month_start
  INTO v_record
  FROM model_token_usage mtu
  WHERE mtu.user_id = p_user_id
    AND mtu.model_name = p_model_name
    AND mtu.month_start = v_month_start;

  -- If not found, create new record
  IF NOT FOUND THEN
    INSERT INTO model_token_usage (user_id, model_name, tokens_used, month_start)
    VALUES (p_user_id, p_model_name, 0, v_month_start)
    RETURNING model_token_usage.id, model_token_usage.tokens_used, model_token_usage.month_start
    INTO v_record;
  END IF;

  -- Return the record
  RETURN QUERY SELECT v_record.id, v_record.tokens_used, v_record.month_start;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update model token usage
CREATE OR REPLACE FUNCTION update_model_token_usage(
  p_user_id UUID,
  p_model_name TEXT,
  p_tokens_to_add INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_month_start DATE;
  v_new_total INTEGER;
BEGIN
  v_month_start := get_current_month_start();

  -- Upsert: insert if not exists, update if exists
  INSERT INTO model_token_usage (user_id, model_name, tokens_used, month_start, updated_at)
  VALUES (p_user_id, p_model_name, p_tokens_to_add, v_month_start, NOW())
  ON CONFLICT (user_id, model_name, month_start)
  DO UPDATE SET
    tokens_used = model_token_usage.tokens_used + p_tokens_to_add,
    updated_at = NOW()
  RETURNING tokens_used INTO v_new_total;

  RETURN v_new_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test queries (run these to verify)
-- SELECT * FROM model_token_usage;
-- SELECT get_or_create_model_token_usage('your-user-id-here', 'o1');
-- SELECT update_model_token_usage('your-user-id-here', 'o1', 1000);
