// NoMoreFOMO Model Configuration
// Based on LMArena rankings and current pricing (as of November 2025)

import { ModelConfig, UserTier } from '../types';

/**
 * MODEL COSTS (per 1M tokens)
 * These are ADMIN ONLY - never exposed to users
 * Updated: November 2025
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
      coding: 4,
      creative: 4,
      math: 3,
      casual: 3,
      data_analysis: 3,
    },
    min_tier: 'free',
  },

  'gemini-2.0-flash-exp': {
    name: 'gemini-2.0-flash-exp',
    provider: 'google',
    displayName: 'Gemini 2.0 Flash',
    cost_per_1m_input: 0.075,  // Estimated (currently free experimental, using Flash 1.5 pricing for analytics)
    cost_per_1m_output: 0.30,  // Estimated (currently free experimental, using Flash 1.5 pricing for analytics)
    max_context_window: 1000000,
    supports_streaming: true,
    lmarena_ranks: {
      coding: 5,
      creative: 4,
      math: 4,
      casual: 2,
      data_analysis: 3,
    },
    min_tier: 'free',  // Free users get Gemini for casual & data_analysis
  },

  // ============================================
  // PRO TIER MODELS (Better performance)
  // ============================================
  'gpt-5-mini': {
    name: 'gpt-5-mini',
    provider: 'openai',
    displayName: 'GPT-5 Mini',
    cost_per_1m_input: 0.25,
    cost_per_1m_output: 2.00,
    max_context_window: 128000,
    supports_streaming: true,
    lmarena_ranks: {
      coding: 3,
      creative: 3,
      math: 2,
      casual: 2,
      data_analysis: 2,
    },
    min_tier: 'pro',
  },

  'claude-3-5-haiku-20241022': {
    name: 'claude-3-5-haiku-20241022',
    provider: 'anthropic',
    displayName: 'Claude 3.5 Haiku',
    cost_per_1m_input: 0.80,
    cost_per_1m_output: 4.00,
    max_context_window: 200000,
    supports_streaming: true,
    lmarena_ranks: {
      coding: 4,
      creative: 5,
      math: 5,
      casual: 4,
      data_analysis: 4,
    },
    min_tier: 'pro',
  },

  // ============================================
  // UNLIMITED TIER (Premium models - November 2025)
  // ============================================
  'gpt-5': {
    name: 'gpt-5',
    provider: 'openai',
    displayName: 'GPT-5',
    cost_per_1m_input: 1.25,
    cost_per_1m_output: 10.00,
    max_context_window: 128000,
    supports_streaming: true,
    lmarena_ranks: {
      coding: 2,
      creative: 1,
      math: 2,
      casual: 1,
      data_analysis: 1,
    },
    min_tier: 'unlimited',
  },

  'claude-sonnet-4-5-20250929': {
    name: 'claude-sonnet-4-5-20250929',
    provider: 'anthropic',
    displayName: 'Claude Sonnet 4.5',
    cost_per_1m_input: 3.00,
    cost_per_1m_output: 15.00,
    max_context_window: 200000,
    supports_streaming: true,
    lmarena_ranks: {
      coding: 1,
      creative: 2,
      math: 1,
      casual: 2,
      data_analysis: 2,
    },
    min_tier: 'unlimited',
  },

  'gemini-3-pro-preview': {
    name: 'gemini-3-pro-preview',
    provider: 'google',
    displayName: 'Gemini 3 Pro',
    cost_per_1m_input: 2.00,
    cost_per_1m_output: 12.00,
    max_context_window: 1000000,
    supports_streaming: true,
    lmarena_ranks: {
      coding: 1,
      creative: 1,
      math: 1,
      casual: 1,
      data_analysis: 1,
    },
    min_tier: 'unlimited',
  },

  // Legacy models (still available but outranked by newer models)
  'gpt-4o': {
    name: 'gpt-4o',
    provider: 'openai',
    displayName: 'GPT-4o',
    cost_per_1m_input: 2.50,
    cost_per_1m_output: 10.00,
    max_context_window: 128000,
    supports_streaming: true,
    lmarena_ranks: {
      coding: 3,
      creative: 3,
      math: 3,
      casual: 3,
      data_analysis: 3,
    },
    min_tier: 'pro',
  },

  'claude-3-5-sonnet-20241022': {
    name: 'claude-3-5-sonnet-20241022',
    provider: 'anthropic',
    displayName: 'Claude 3.5 Sonnet V2',
    cost_per_1m_input: 3.00,
    cost_per_1m_output: 15.00,
    max_context_window: 200000,
    supports_streaming: true,
    lmarena_ranks: {
      coding: 2,
      creative: 3,
      math: 2,
      casual: 3,
      data_analysis: 2,
    },
    min_tier: 'pro',
  },

  // ============================================
  // REASONING MODELS (Pro & Unlimited - November 2025)
  // ============================================
  'gpt-5.1': {
    name: 'gpt-5.1',
    provider: 'openai',
    displayName: 'GPT-5.1 (Advanced Reasoning)',
    cost_per_1m_input: 1.25,
    cost_per_1m_output: 10.00,
    max_context_window: 128000,
    supports_streaming: false, // GPT-5.1 uses thinking mode (non-streaming like o1)
    lmarena_ranks: {
      coding: 1, // Top-tier reasoning for coding
      creative: 4, // Not ideal for creative tasks
      math: 1, // Excellent for complex math
      casual: 5, // Overkill for casual
      data_analysis: 1, // Best for deep analysis
    },
    min_tier: 'unlimited',
    // STRICT CAP: Max 200K tokens/month per user for cost control
    monthly_token_cap: 200000,
    preferred_categories: ['coding', 'math', 'data_analysis'],
  },

  'o1-mini': {
    name: 'o1-mini',
    provider: 'openai',
    displayName: 'o1-mini (Reasoning)',
    cost_per_1m_input: 3.00,
    cost_per_1m_output: 12.00,
    max_context_window: 128000,
    supports_streaming: false, // o1 models don't support streaming
    lmarena_ranks: {
      coding: 2, // Good for coding but outranked by GPT-5.1
      creative: 4, // Not ideal for creative tasks
      math: 2, // Good for math but outranked
      casual: 5, // Overkill for casual
      data_analysis: 2, // Good for analysis
    },
    min_tier: 'pro',
    // Special: Only use for coding, math, data_analysis tasks
    preferred_categories: ['coding', 'math', 'data_analysis'],
  },

  'o1': {
    name: 'o1',
    provider: 'openai',
    displayName: 'o1 (Advanced Reasoning)',
    cost_per_1m_input: 15.00,
    cost_per_1m_output: 60.00,
    max_context_window: 200000,
    supports_streaming: false,
    lmarena_ranks: {
      coding: 2, // Excellent but expensive, GPT-5.1 is better value
      creative: 5,
      math: 1, // Still best for PhD-level math
      casual: 6, // Way too expensive for casual
      data_analysis: 2,
    },
    min_tier: 'unlimited',
    // STRICT CAP: Max 200K tokens/month per user for cost control
    monthly_token_cap: 200000,
    preferred_categories: ['math'], // Now only preferred for extreme math tasks
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
 * Respects preferred_categories for reasoning models
 */
export function getBestModelForTask(
  category: string,
  tier: UserTier
): ModelConfig | null {
  const availableModels = getModelsForTier(tier);

  // Filter models:
  // 1. Must have ranking for this category
  // 2. If model has preferred_categories, only use for those categories
  const eligibleModels = availableModels
    .filter((model) => {
      // Must have a rank for this category
      if (!model.lmarena_ranks[category as keyof typeof model.lmarena_ranks]) {
        return false;
      }

      // If model specifies preferred_categories, only use for those
      if (model.preferred_categories && model.preferred_categories.length > 0) {
        return model.preferred_categories.includes(category as any);
      }

      // Otherwise, model is eligible for all categories
      return true;
    });

  // Sort by rank for this category (lower rank = better)
  // For same rank, prefer cheaper models (cost-optimized routing)
  const sorted = eligibleModels.sort((a, b) => {
    const rankA = a.lmarena_ranks[category as keyof typeof a.lmarena_ranks];
    const rankB = b.lmarena_ranks[category as keyof typeof b.lmarena_ranks];

    // If ranks are equal, prefer cheaper model
    if (rankA === rankB) {
      const avgCostA = (a.cost_per_1m_input + a.cost_per_1m_output) / 2;
      const avgCostB = (b.cost_per_1m_input + b.cost_per_1m_output) / 2;
      return avgCostA - avgCostB;
    }

    return rankA - rankB;
  });

  return sorted[0] || null;
}

/**
 * TIER PRICING CONFIGURATION
 * For display to users considering upgrades
 * Updated: November 2025 with latest models
 */
export const TIER_PRICING = {
  free: {
    name: 'Free',
    price: 0,
    monthlyTokens: '100K tokens/month',
    requestsPerDay: '200 requests/day',
    models: 'Low-cost models',
    features: [
      '100K tokens per month',
      'Up to 200 requests per day',
      'Access to low-cost models such as GPT-4o mini, Gemini 2.0 Flash, and similar',
      'Up to 10 premium model answers a month',
      'Might be showing ads (without influencing model\'s answer)',
    ],
  },
  pro: {
    name: 'Pro',
    price: 12,
    monthlyTokens: '1M tokens/month',
    requestsPerDay: '1,000 requests/day',
    models: 'Premium models + Reasoning',
    features: [
      '1M tokens per month',
      'Up to 1,000 requests per day',
      'Access to premium models: GPT-5 Mini, GPT-4o, Claude 3.5 Sonnet V2, Claude 3.5 Haiku',
      'o1-mini reasoning model for coding & math tasks',
      'Larger context windows (128-200K)',
      'Priority support',
    ],
  },
  unlimited: {
    name: 'Unlimited',
    price: 49,
    monthlyTokens: '10M tokens/month',
    requestsPerDay: '10,000 requests/day',
    models: 'All models + Advanced Reasoning',
    features: [
      'Up to 10M tokens per month',
      'Up to 10,000 requests per day',
      'Access to ALL latest models: GPT-5, Claude Sonnet 4.5, Gemini 3 Pro',
      'GPT-5.1 advanced reasoning (capped at 200K tokens/month)',
      'o1 PhD-level reasoning for extreme math (capped at 200K tokens/month)',
      'Maximum context windows (up to 1M tokens)',
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
