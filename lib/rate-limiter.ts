// NoMoreFOMO Rate Limiting & Abuse Prevention System

import { createClient } from './supabase/server';
import { RateLimitResult, UserProfile, TierLimits } from './types';
import { detectSuspiciousPrompt, calculatePromptSimilarity } from './llm/prompt-analyzer';

/**
 * Tier limits configuration
 */
const TIER_LIMITS: Record<string, TierLimits> = {
  free: {
    tier: 'free',
    monthly_token_limit: 100000,
    max_tokens_per_request: 2000,
    requests_per_minute: 5,
    requests_per_hour: 50,
    requests_per_day: 200,
    allowed_models: ['gpt-4o-mini', 'gemini-2.0-flash-thinking-exp-01-21'],
    max_context_window: 8000,
    can_use_premium_models: false,
    priority_queue: false,
    premium_requests_per_month: 10, // HYBRID MODEL: 10 premium requests for free users!
  },
  pro: {
    tier: 'pro',
    monthly_token_limit: 2000000, // 2M tokens/month ($12/month)
    max_tokens_per_request: 8000,
    requests_per_minute: 20,
    requests_per_hour: 300,
    requests_per_day: 2000,
    allowed_models: [
      'gpt-4o-mini',
      'gemini-2.0-flash-thinking-exp-01-21',
      'claude-3-5-haiku-20241022',
      'gpt-4o', // NEW: Pro tier now gets GPT-4o!
      'claude-3-5-sonnet', // NEW: Pro tier now gets Claude Sonnet!
    ],
    max_context_window: 32000,
    can_use_premium_models: true,
    priority_queue: false,
    premium_requests_per_month: 200,
  },
  unlimited: {
    tier: 'unlimited',
    monthly_token_limit: 10000000, // 10M tokens/month ($49/month)
    max_tokens_per_request: 32000,
    requests_per_minute: 60,
    requests_per_hour: 2000,
    requests_per_day: 10000,
    allowed_models: [
      'gpt-4o-mini',
      'gemini-2.0-flash-thinking-exp-01-21',
      'claude-3-5-haiku-20241022',
      'gpt-4o',
      'claude-3-5-sonnet',
    ],
    max_context_window: 200000,
    can_use_premium_models: true,
    priority_queue: true,
    premium_requests_per_month: -1, // Unlimited
  },
};

/**
 * Check if user is within rate limits
 */
export async function checkRateLimit(
  userId: string,
  estimatedTokens: number
): Promise<RateLimitResult> {
  const supabase = await createClient();

  // Get user profile
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return {
      allowed: false,
      reason: 'User profile not found',
    };
  }

  // Check if user is suspended
  if (profile.is_suspended) {
    return {
      allowed: false,
      reason: profile.suspension_reason || 'Account suspended',
    };
  }

  const limits = TIER_LIMITS[profile.tier];

  // Check monthly token limit (skip for unlimited tier)
  if (limits.monthly_token_limit !== -1) {
    const tokensRemaining =
      limits.monthly_token_limit - profile.tokens_used_this_month;

    if (tokensRemaining < estimatedTokens) {
      return {
        allowed: false,
        reason: 'Monthly token limit exceeded',
        limitType: 'monthly_tokens',
      };
    }
  }

  // Check per-request token limit
  if (estimatedTokens > limits.max_tokens_per_request) {
    return {
      allowed: false,
      reason: `Request exceeds maximum tokens (${limits.max_tokens_per_request})`,
    };
  }

  // Check time-based rate limits
  const now = new Date();

  // Minute limit
  const minuteCheck = await checkTimeWindow(
    userId,
    'minute',
    limits.requests_per_minute,
    60
  );
  if (!minuteCheck.allowed) {
    return {
      ...minuteCheck,
      limitType: 'minute',
    };
  }

  // Hour limit
  const hourCheck = await checkTimeWindow(
    userId,
    'hour',
    limits.requests_per_hour,
    3600
  );
  if (!hourCheck.allowed) {
    return {
      ...hourCheck,
      limitType: 'hour',
    };
  }

  // Day limit
  const dayCheck = await checkTimeWindow(
    userId,
    'day',
    limits.requests_per_day,
    86400
  );
  if (!dayCheck.allowed) {
    return {
      ...dayCheck,
      limitType: 'day',
    };
  }

  return { allowed: true };
}

/**
 * Check rate limit for a specific time window
 */
async function checkTimeWindow(
  userId: string,
  windowType: 'minute' | 'hour' | 'day',
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const supabase = await createClient();
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowSeconds * 1000);

  // Count requests in this window
  const { count, error } = await supabase
    .from('rate_limit_tracking')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('window_type', windowType)
    .gte('window_start', windowStart.toISOString());

  if (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true }; // Fail open (allow on error)
  }

  if ((count || 0) >= maxRequests) {
    return {
      allowed: false,
      reason: `Rate limit exceeded: ${maxRequests} requests per ${windowType}`,
      retryAfter: windowSeconds,
    };
  }

  return { allowed: true };
}

/**
 * Record a request for rate limiting
 */
export async function recordRequest(userId: string): Promise<void> {
  const supabase = await createClient();
  const now = new Date();

  // Record for minute, hour, and day windows
  const windows = [
    { type: 'minute', start: new Date(now.getTime() - 60 * 1000) },
    { type: 'hour', start: new Date(now.getTime() - 3600 * 1000) },
    { type: 'day', start: new Date(now.getTime() - 86400 * 1000) },
  ];

  for (const window of windows) {
    await supabase.from('rate_limit_tracking').insert({
      user_id: userId,
      window_type: window.type,
      window_start: now.toISOString(),
      request_count: 1,
    });
  }

  // Update last_request_at
  await supabase
    .from('user_profiles')
    .update({ last_request_at: now.toISOString() })
    .eq('id', userId);
}

/**
 * Update user's token usage
 */
export async function updateTokenUsage(
  userId: string,
  tokensUsed: number,
  costUsd: number
): Promise<void> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('tokens_used_this_month, total_tokens_used, total_cost_usd')
    .eq('id', userId)
    .single();

  if (profile) {
    await supabase
      .from('user_profiles')
      .update({
        tokens_used_this_month: profile.tokens_used_this_month + tokensUsed,
        total_tokens_used: profile.total_tokens_used + tokensUsed,
        total_cost_usd: profile.total_cost_usd + costUsd,
      })
      .eq('id', userId);
  }
}

/**
 * Detect and log abusive behavior
 */
export async function detectAbuse(
  userId: string,
  prompt: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{
  isAbusive: boolean;
  reason?: string;
  shouldSuspend?: boolean;
}> {
  const supabase = await createClient();

  // Check for suspicious prompt patterns
  const suspiciousCheck = detectSuspiciousPrompt(prompt);
  if (suspiciousCheck.isSuspicious) {
    await logAbuseViolation(
      userId,
      'suspicious_prompt',
      { reason: suspiciousCheck.reason, prompt: prompt.substring(0, 100) },
      ipAddress,
      userAgent
    );

    return {
      isAbusive: true,
      reason: suspiciousCheck.reason,
    };
  }

  // Check for repeated identical prompts
  const { data: recentMessages } = await supabase
    .from('messages')
    .select('content')
    .eq('role', 'user')
    .order('created_at', { ascending: false })
    .limit(5);

  if (recentMessages && recentMessages.length > 0) {
    let identicalCount = 0;

    for (const msg of recentMessages) {
      const similarity = calculatePromptSimilarity(prompt, msg.content);
      if (similarity > 0.95) {
        identicalCount++;
      }
    }

    if (identicalCount >= 5) {
      await logAbuseViolation(
        userId,
        'repeated_prompts',
        { count: identicalCount },
        ipAddress,
        userAgent
      );

      return {
        isAbusive: true,
        reason: 'Detected repeated identical prompts',
      };
    }
  }

  // Check request frequency (too fast = bot)
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('last_request_at')
    .eq('id', userId)
    .single();

  if (profile?.last_request_at) {
    const lastRequest = new Date(profile.last_request_at);
    const now = new Date();
    const secondsSinceLastRequest = (now.getTime() - lastRequest.getTime()) / 1000;

    if (secondsSinceLastRequest < 2) {
      // Less than 2 seconds between requests
      await logAbuseViolation(
        userId,
        'too_fast',
        { seconds_since_last: secondsSinceLastRequest },
        ipAddress,
        userAgent
      );

      return {
        isAbusive: true,
        reason: 'Requests too frequent (possible bot)',
      };
    }
  }

  // Check total abuse log count
  const { count: abuseCount } = await supabase
    .from('abuse_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Suspend if more than 10 violations
  if ((abuseCount || 0) >= 10) {
    await supabase
      .from('user_profiles')
      .update({
        is_suspended: true,
        suspension_reason: 'Multiple abuse violations detected',
        suspicious_activity_count: abuseCount || 0,
      })
      .eq('id', userId);

    return {
      isAbusive: true,
      reason: 'Account suspended due to repeated violations',
      shouldSuspend: true,
    };
  }

  return { isAbusive: false };
}

/**
 * Log abuse violation
 */
async function logAbuseViolation(
  userId: string,
  violationType: string,
  details: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const supabase = await createClient();

  await supabase.from('abuse_logs').insert({
    user_id: userId,
    violation_type: violationType,
    details,
    ip_address: ipAddress,
    user_agent: userAgent,
  });

  // Increment suspicious activity count
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('suspicious_activity_count')
    .eq('id', userId)
    .single();

  if (profile) {
    await supabase
      .from('user_profiles')
      .update({
        suspicious_activity_count: profile.suspicious_activity_count + 1,
      })
      .eq('id', userId);
  }
}

/**
 * Get user's current usage stats
 */
export async function getUserUsageStats(userId: string): Promise<{
  tokensUsed: number;
  tokensLimit: number;
  tokensRemaining: number;
  requestsToday: number;
  requestsLimitToday: number;
  percentageUsed: number;
  tier: string;
  premiumRequestsRemaining: number;
  premiumRequestsLimit: number;
}> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!profile) {
    throw new Error('User profile not found');
  }

  const limits = TIER_LIMITS[profile.tier];

  // Count today's requests
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count: requestsToday } = await supabase
    .from('rate_limit_tracking')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('window_type', 'day')
    .gte('window_start', today.toISOString());

  const tokensLimit =
    limits.monthly_token_limit === -1 ? Infinity : limits.monthly_token_limit;
  const tokensRemaining =
    tokensLimit === Infinity
      ? Infinity
      : tokensLimit - profile.tokens_used_this_month;
  const percentageUsed =
    tokensLimit === Infinity
      ? 0
      : (profile.tokens_used_this_month / tokensLimit) * 100;

  const premiumRequestsLimit = limits.premium_requests_per_month === -1
    ? Infinity
    : limits.premium_requests_per_month;
  const premiumRequestsRemaining = premiumRequestsLimit === Infinity
    ? Infinity
    : premiumRequestsLimit - (profile.premium_requests_this_month || 0);

  return {
    tokensUsed: profile.tokens_used_this_month,
    tokensLimit,
    tokensRemaining,
    requestsToday: requestsToday || 0,
    requestsLimitToday: limits.requests_per_day,
    percentageUsed,
    tier: profile.tier,
    premiumRequestsRemaining,
    premiumRequestsLimit,
  };
}

/**
 * Check if user can use a premium request (for hybrid model)
 */
export async function canUsePremiumRequest(userId: string, userTier: string): Promise<boolean> {
  // Pro and Unlimited tiers can always use premium models
  if (userTier === 'pro' || userTier === 'unlimited') {
    return true;
  }

  // Free tier users need to check their premium request quota
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('premium_requests_this_month')
    .eq('id', userId)
    .single();

  if (!profile) return false;

  const limits = TIER_LIMITS[userTier];
  const used = profile.premium_requests_this_month || 0;
  
  return used < limits.premium_requests_per_month;
}

/**
 * Increment premium request counter (for hybrid model)
 */
export async function incrementPremiumRequest(userId: string): Promise<void> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('premium_requests_this_month')
    .eq('id', userId)
    .single();

  if (profile) {
    await supabase
      .from('user_profiles')
      .update({
        premium_requests_this_month: (profile.premium_requests_this_month || 0) + 1,
      })
      .eq('id', userId);
  }
}

/**
 * Get tier limits (exported for use in other modules)
 */
export function getTierLimits(tier: string): TierLimits {
  return TIER_LIMITS[tier];
}
