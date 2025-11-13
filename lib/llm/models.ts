// NoMoreFOMO Model Configuration
// Based on LMArena rankings and current pricing (as of Jan 2025)

import { ModelConfig, UserTier } from '../types';

/**
 * MODEL COSTS (per 1M tokens)
 * These are ADMIN ONLY - never exposed to users
 * Updated: January 2025
 */
export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  // ============================================
  // FREE TIER MODELS (Budget-friendly)
  // ============================================
  'gpt-4o-mini': {
    name: 'gpt-4o-mini',
    provider: 'openai',
    displayName: 'GPT-4o Mini',
    cost_per_1m_input: 0.15,
    cost_per_1m_output: 0.60,
    max_context_window: 128000,
    supports_streaming: true,
    lmarena_ranks: {
      coding: 2,
      creative: 1,
      math: 1,
      casual: 2,
      data_analysis: 2,
    },
    min_tier: 'free',
  },

  'gemini-2.0-flash-thinking-exp-01-21': {
    name: 'gemini-2.0-flash-thinking-exp-01-21',
    provider: 'google',
    displayName: 'Gemini 2.0 Flash',
    cost_per_1m_input: 0.075,  // Estimated (currently free experimental, using Flash 1.5 pricing for analytics)
    cost_per_1m_output: 0.30,  // Estimated (currently free experimental, using Flash 1.5 pricing for analytics)
    max_context_window: 1000000,
    supports_streaming: true,
    lmarena_ranks: {
      coding: 3,
      creative: 3,
      math: 2,
      casual: 1,
      data_analysis: 1,
    },
    min_tier: 'free',  // Free users get Gemini for casual & data_analysis
  },

  // ============================================
  // PRO TIER MODELS (Better performance)
  // ============================================
  'claude-3-5-haiku-20241022': {
    name: 'claude-3-5-haiku-20241022',
    provider: 'anthropic',
    displayName: 'Claude 3.5 Haiku',
    cost_per_1m_input: 0.80,
    cost_per_1m_output: 4.00,
    max_context_window: 200000,
    supports_streaming: true,
    lmarena_ranks: {
      coding: 1,
      creative: 2,
      math: 3,
      casual: 3,
      data_analysis: 3,
    },
    min_tier: 'pro',
  },

  // ============================================
  // UNLIMITED TIER (Premium models)
  // ============================================
  'gpt-4o': {
    name: 'gpt-4o',
    provider: 'openai',
    displayName: 'GPT-4o',
    cost_per_1m_input: 2.50,
    cost_per_1m_output: 10.00,
    max_context_window: 128000,
    supports_streaming: true,
    lmarena_ranks: {
      coding: 2,
      creative: 1,
      math: 1,
      casual: 1,
      data_analysis: 1,
    },
    min_tier: 'unlimited',
  },

  'claude-3-5-sonnet': {
    name: 'claude-3-5-sonnet',
    provider: 'anthropic',
    displayName: 'Claude 3.5 Sonnet',
    cost_per_1m_input: 3.00,
    cost_per_1m_output: 15.00,
    max_context_window: 200000,
    supports_streaming: true,
    lmarena_ranks: {
      coding: 1,
      creative: 2,
      math: 2,
      casual: 2,
      data_analysis: 2,
    },
    min_tier: 'unlimited',
  },
};

/**
 * Get models available for a specific tier
 */
export function getModelsForTier(tier: UserTier): ModelConfig[] {
  const tierOrder: Record<UserTier, number> = {
    free: 0,
    pro: 1,
    unlimited: 2,
  };

  return Object.values(MODEL_CONFIGS).filter(
    (model) => tierOrder[model.min_tier] <= tierOrder[tier]
  );
}

/**
 * Calculate cost for a request (ADMIN ONLY)
 */
export function calculateCost(
  modelName: string,
  inputTokens: number,
  outputTokens: number
): number {
  const model = MODEL_CONFIGS[modelName];
  if (!model) return 0;

  const inputCost = (inputTokens / 1_000_000) * model.cost_per_1m_input;
  const outputCost = (outputTokens / 1_000_000) * model.cost_per_1m_output;

  return inputCost + outputCost;
}

/**
 * Get the best model for a task category and tier
 */
export function getBestModelForTask(
  category: string,
  tier: UserTier
): ModelConfig | null {
  const availableModels = getModelsForTier(tier);

  // Sort by rank for this category (lower rank = better)
  const sorted = availableModels
    .filter((model) => model.lmarena_ranks[category as keyof typeof model.lmarena_ranks])
    .sort((a, b) => {
      const rankA = a.lmarena_ranks[category as keyof typeof a.lmarena_ranks];
      const rankB = b.lmarena_ranks[category as keyof typeof b.lmarena_ranks];
      return rankA - rankB;
    });

  return sorted[0] || null;
}

/**
 * TIER PRICING CONFIGURATION
 * For display to users considering upgrades
 */
export const TIER_PRICING = {
  free: {
    name: 'Free',
    price: 0,
    monthlyTokens: '100K tokens/month',
    requestsPerDay: '200 requests/day',
    models: 'Budget models only',
    features: [
      '100,000 tokens per month',
      'Up to 200 requests per day',
      'Access to GPT-4o Mini & Gemini Flash',
      'Standard response time',
    ],
  },
  pro: {
    name: 'Pro',
    price: 12,
    monthlyTokens: '2M tokens/month',
    requestsPerDay: '2,000 requests/day',
    models: 'All models including GPT-4o & Claude Sonnet',
    features: [
      '2,000,000 tokens per month',
      'Up to 2,000 requests per day',
      'Access to GPT-4o & Claude Sonnet',
      'Smart routing for cost efficiency',
      'Larger context windows (32K)',
      'Priority support',
    ],
  },
  unlimited: {
    name: 'Unlimited',
    price: 49,
    monthlyTokens: '10M tokens/month',
    requestsPerDay: '10,000 requests/day',
    models: 'All premium models',
    features: [
      '10,000,000 tokens per month',
      'Up to 10,000 requests per day',
      'Access to all models (GPT-4o, Claude Sonnet)',
      'Smart routing for optimal results',
      'Maximum context windows (200K)',
      'Priority queue',
      'Dedicated support',
    ],
  },
};

/**
 * FREEMIUM LIMIT RECOMMENDATIONS
 * Based on typical usage patterns
 */
export const FREEMIUM_STRATEGY = {
  // When to show upgrade prompts
  softLimit: {
    tokensUsedPercent: 80, // Show "You're using a lot" at 80%
    requestsRemainingToday: 20, // Warn when under 20 requests left
  },

  // Hard limits (show paywall)
  hardLimit: {
    tokensUsedPercent: 100,
    requestsExceeded: true,
  },

  // Abuse detection thresholds
  abuseThresholds: {
    maxRequestsPerMinute: 10, // More than this = suspicious
    maxConsecutiveErrors: 5,
    maxSamePromptRepeats: 3,
    minSecondsBetweenRequests: 2,
  },

  // Typical user metrics (for comparison)
  typicalUser: {
    tokensPerDay: 5000,
    requestsPerDay: 20,
    avgTokensPerRequest: 800,
  },
};
