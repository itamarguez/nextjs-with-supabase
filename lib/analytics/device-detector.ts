// Device Detection & User Agent Parsing
// Extract device type, browser, OS from user agent string

export interface DeviceInfo {
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  browser: string;
  os: string;
}

export function parseUserAgent(userAgent: string | null): DeviceInfo {
  if (!userAgent) {
    return {
      deviceType: 'unknown',
      browser: 'Unknown',
      os: 'Unknown',
    };
  }

  const ua = userAgent.toLowerCase();

  // Detect device type
  let deviceType: DeviceInfo['deviceType'] = 'desktop';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(userAgent)) {
    deviceType = 'tablet';
  } else if (/mobile|iphone|ipod|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(userAgent)) {
    deviceType = 'mobile';
  }

  // Detect browser
  let browser = 'Unknown';
  if (ua.includes('edg/') || ua.includes('edge/')) {
    browser = 'Edge';
  } else if (ua.includes('chrome/') && !ua.includes('edg')) {
    browser = 'Chrome';
  } else if (ua.includes('safari/') && !ua.includes('chrome')) {
    browser = 'Safari';
  } else if (ua.includes('firefox/')) {
    browser = 'Firefox';
  } else if (ua.includes('opera/') || ua.includes('opr/')) {
    browser = 'Opera';
  } else if (ua.includes('trident/') || ua.includes('msie')) {
    browser = 'Internet Explorer';
  }

  // Detect OS
  let os = 'Unknown';
  if (ua.includes('windows nt 10.0')) {
    os = 'Windows 10/11';
  } else if (ua.includes('windows nt 6.3')) {
    os = 'Windows 8.1';
  } else if (ua.includes('windows nt 6.2')) {
    os = 'Windows 8';
  } else if (ua.includes('windows nt 6.1')) {
    os = 'Windows 7';
  } else if (ua.includes('windows')) {
    os = 'Windows';
  } else if (ua.includes('mac os x')) {
    const match = userAgent.match(/mac os x ([\d_]+)/i);
    if (match) {
      const version = match[1].replace(/_/g, '.');
      os = `macOS ${version}`;
    } else {
      os = 'macOS';
    }
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    const match = userAgent.match(/os ([\d_]+)/i);
    if (match) {
      const version = match[1].replace(/_/g, '.');
      os = `iOS ${version}`;
    } else {
      os = 'iOS';
    }
  } else if (ua.includes('android')) {
    const match = userAgent.match(/android ([\d.]+)/i);
    if (match) {
      os = `Android ${match[1]}`;
    } else {
      os = 'Android';
    }
  } else if (ua.includes('linux')) {
    os = 'Linux';
  } else if (ua.includes('ubuntu')) {
    os = 'Ubuntu';
  } else if (ua.includes('cros')) {
    os = 'Chrome OS';
  }

  return {
    deviceType,
    browser,
    os,
  };
}

// Get country code from IP address (simplified - use a real geolocation service for production)
export async function getCountryFromIP(ip: string | null): Promise<string | null> {
  if (!ip) return null;

  // For localhost/development
  if (ip === '127.0.0.1' || ip === '::1' || ip?.includes('localhost')) {
    return 'LOCAL';
  }

  try {
    // Using ipapi.co free tier (1000 requests/day)
    // Alternative: ip-api.com (45 requests/minute free)
    const response = await fetch(`https://ipapi.co/${ip}/country_code/`, {
      headers: { 'User-Agent': 'NoMoreFOMO Analytics' },
    });

    if (response.ok) {
      const countryCode = await response.text();
      return countryCode.trim() || null;
    }
  } catch (error) {
    console.error('Failed to get country from IP:', error);
  }

  return null;
}
