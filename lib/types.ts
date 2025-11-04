// NoMoreFOMO Type Definitions

export type UserTier = 'free' | 'pro' | 'unlimited';

export type TaskCategory = 'coding' | 'creative' | 'math' | 'casual' | 'data_analysis';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface UserProfile {
  id: string;
  tier: UserTier;

  // Subscription
  subscription_start_date?: string;
  subscription_end_date?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;

  // Usage (visible only to admin)
  tokens_used_this_month: number;
  requests_this_month: number;
  premium_requests_this_month: number; // For hybrid model
  month_reset_date: string;

  total_tokens_used: number;
  total_requests: number;
  total_cost_usd: number;

  // Abuse prevention
  is_suspended: boolean;
  suspension_reason?: string;
  suspicious_activity_count: number;
  last_request_at?: string;

  created_at: string;
  updated_at: string;
}

export interface TierLimits {
  tier: UserTier;
  monthly_token_limit: number; // -1 for unlimited
  max_tokens_per_request: number;
  requests_per_minute: number;
  requests_per_hour: number;
  requests_per_day: number;
  allowed_models: string[];
  max_context_window: number;
  can_use_premium_models: boolean;
  priority_queue: boolean;
  premium_requests_per_month: number; // For hybrid model
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  total_tokens: number; // Hidden from user
  total_cost_usd: number; // Hidden from user
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;

  // Model info (only for assistant)
  model_used?: string;
  task_category?: TaskCategory;
  selection_reason?: string; // Why this model was chosen

  // Hidden analytics
  tokens_used?: number;
  cost_usd?: number;
  latency_ms?: number;

  created_at: string;
}

export interface ModelConfig {
  name: string;
  provider: 'openai' | 'anthropic' | 'google';
  displayName: string;

  // Cost (per 1M tokens) - ADMIN ONLY
  cost_per_1m_input: number;
  cost_per_1m_output: number;

  // Capabilities
  max_context_window: number;
  supports_streaming: boolean;

  // Performance
  lmarena_ranks: {
    coding: number;
    creative: number;
    math: number;
    casual: number;
    data_analysis: number;
  };

  // Access control
  min_tier: UserTier;
}

export interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  retryAfter?: number; // Seconds until next request allowed
  limitType?: 'minute' | 'hour' | 'day' | 'monthly_tokens';
}

export interface ModelSelectionResult {
  model: string;
  reason: string;
  category: TaskCategory;
  estimatedTokens: number;
  isPremium: boolean; // Whether this uses a premium request
  betterModelAvailable?: string; // For upgrade prompts
}

export interface UsageStats {
  tokensRemaining: number;
  requestsRemainingToday: number;
  percentageUsed: number;
  willResetAt: string;
  premiumRequestsRemaining: number; // For hybrid model
  premiumRequestsLimit: number;
}

export interface AbuseLog {
  id: string;
  user_id?: string;
  violation_type: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}
