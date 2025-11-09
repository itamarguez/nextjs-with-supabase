-- Enhance Anonymous Conversations Table with Rich Metadata
-- Add device type, browser, OS, country, and referrer tracking

-- Add new columns to anonymous_conversations table
ALTER TABLE anonymous_conversations
ADD COLUMN IF NOT EXISTS device_type TEXT, -- 'mobile', 'tablet', 'desktop'
ADD COLUMN IF NOT EXISTS browser TEXT, -- 'Chrome', 'Safari', 'Firefox', etc.
ADD COLUMN IF NOT EXISTS os TEXT, -- 'iOS', 'Android', 'Windows', 'macOS', etc.
ADD COLUMN IF NOT EXISTS country_code TEXT, -- 'US', 'GB', 'IL', etc. (from IP)
ADD COLUMN IF NOT EXISTS referrer TEXT; -- Where did the request come from

-- Add indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_anonymous_device_type ON anonymous_conversations(device_type);
CREATE INDEX IF NOT EXISTS idx_anonymous_browser ON anonymous_conversations(browser);
CREATE INDEX IF NOT EXISTS idx_anonymous_country ON anonymous_conversations(country_code);

-- Add comments for documentation
COMMENT ON COLUMN anonymous_conversations.device_type IS 'Device category: mobile, tablet, or desktop';
COMMENT ON COLUMN anonymous_conversations.browser IS 'Browser name extracted from user agent';
COMMENT ON COLUMN anonymous_conversations.os IS 'Operating system extracted from user agent';
COMMENT ON COLUMN anonymous_conversations.country_code IS 'ISO country code derived from IP geolocation';
COMMENT ON COLUMN anonymous_conversations.referrer IS 'HTTP referrer to track traffic sources';
