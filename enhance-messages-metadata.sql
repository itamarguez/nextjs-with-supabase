-- Enhance Messages Table with Rich Metadata
-- Add IP address, user agent, device info, and geographic data for analytics

-- Add new columns to messages table
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS device_type TEXT, -- 'mobile', 'tablet', 'desktop'
ADD COLUMN IF NOT EXISTS browser TEXT, -- 'Chrome', 'Safari', 'Firefox', etc.
ADD COLUMN IF NOT EXISTS os TEXT, -- 'iOS', 'Android', 'Windows', 'macOS', etc.
ADD COLUMN IF NOT EXISTS country_code TEXT, -- 'US', 'GB', 'IL', etc. (from IP)
ADD COLUMN IF NOT EXISTS referrer TEXT; -- Where did the request come from

-- Add index for analytics queries
CREATE INDEX IF NOT EXISTS idx_messages_ip_address ON messages(ip_address);
CREATE INDEX IF NOT EXISTS idx_messages_device_type ON messages(device_type);
CREATE INDEX IF NOT EXISTS idx_messages_browser ON messages(browser);
CREATE INDEX IF NOT EXISTS idx_messages_country ON messages(country_code);

-- Add comments for documentation
COMMENT ON COLUMN messages.ip_address IS 'User IP address for analytics and abuse prevention';
COMMENT ON COLUMN messages.user_agent IS 'Full user agent string for device/browser detection';
COMMENT ON COLUMN messages.device_type IS 'Device category: mobile, tablet, or desktop';
COMMENT ON COLUMN messages.browser IS 'Browser name extracted from user agent';
COMMENT ON COLUMN messages.os IS 'Operating system extracted from user agent';
COMMENT ON COLUMN messages.country_code IS 'ISO country code derived from IP geolocation';
COMMENT ON COLUMN messages.referrer IS 'HTTP referrer to track traffic sources';
