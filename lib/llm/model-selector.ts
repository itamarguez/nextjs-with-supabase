// NoMoreFOMO Model Selection Algorithm
// Intelligently selects the best model based on task type, user tier, and rankings

import { UserTier, TaskCategory, ModelSelectionResult } from '../types';
import { MODEL_CONFIGS, getBestModelForTask } from './models';
import { analyzePrompt } from './prompt-analyzer';

/**
 * Select the optimal model for a user's prompt (HYBRID MODEL SUPPORT)
 */
export function selectModelForPrompt(
  prompt: string,
  userTier: UserTier,
  conversationHistory?: Array<{ role: string; content: string }>,
  hasPremiumCredits: boolean = false
): ModelSelectionResult {
  // Analyze the prompt to determine task category
  const analysis = analyzePrompt(prompt);

  // For free users with premium credits, temporarily allow premium models
  const effectiveTier = (userTier === 'free' && hasPremiumCredits) ? 'pro' : userTier;

  // Get the best model for this task category within the user's tier
  const selectedModel = getBestModelForTask(analysis.category, effectiveTier);

  // Check if there's a better model available in a higher tier
  const bestPremiumModel = getBestModelForTask(analysis.category, 'pro');
  const betterModelAvailable =
    userTier === 'free' &&
    !hasPremiumCredits &&
    bestPremiumModel &&
    bestPremiumModel.name !== selectedModel?.name
      ? bestPremiumModel.displayName
      : undefined;

  if (!selectedModel) {
    // Fallback to cheapest available model
    const fallbackModel = MODEL_CONFIGS['gpt-4o-mini'];
    return {
      model: fallbackModel.name,
      reason: `Using ${fallbackModel.displayName} (default model)`,
      category: analysis.category,
      estimatedTokens: analysis.estimatedTokens,
      isPremium: false,
      betterModelAvailable,
    };
  }

  // Calculate estimated total tokens (prompt + history + expected response)
  const historyTokens = conversationHistory
    ? conversationHistory.reduce(
        (sum, msg) => sum + Math.ceil(msg.content.length / 4),
        0
      )
    : 0;

  const estimatedTotalTokens = analysis.estimatedTokens + historyTokens + 500; // +500 for response

  // Determine if this is a premium model request
  const isPremium = selectedModel.min_tier === 'pro' || selectedModel.min_tier === 'unlimited';

  // Build human-readable explanation
  const reason = buildSelectionReason(
    selectedModel.displayName,
    analysis.category,
    analysis.confidence,
    userTier,
    isPremium && userTier === 'free'
  );

  return {
    model: selectedModel.name,
    reason,
    category: analysis.category,
    estimatedTokens: estimatedTotalTokens,
    isPremium,
    betterModelAvailable,
  };
}

/**
 * Build a user-friendly explanation of why this model was chosen
 */
function buildSelectionReason(
  modelName: string,
  category: TaskCategory,
  confidence: number,
  tier: UserTier,
  usedPremiumCredit: boolean = false
): string {
  const categoryDescriptions: Record<TaskCategory, string> = {
    coding: 'coding and technical tasks',
    creative: 'creative writing and content generation',
    math: 'mathematical reasoning and calculations',
    casual: 'general conversation',
    data_analysis: 'data analysis and summarization',
  };

  const categoryDesc = categoryDescriptions[category];

  // Special message when free user uses premium credit
  if (usedPremiumCredit) {
    return `${modelName} excels at ${categoryDesc} ⭐ Premium answer`;
  }

  if (confidence > 0.7) {
    return `${modelName} excels at ${categoryDesc} (ranked #1 in your tier)`;
  } else if (confidence > 0.4) {
    return `${modelName} performs well for ${categoryDesc}`;
  } else {
    return `${modelName} is a versatile choice for your request`;
  }
}

/**
 * Check if a model is available for a user's tier
 */
export function isModelAvailableForTier(
  modelName: string,
  userTier: UserTier
): boolean {
  const model = MODEL_CONFIGS[modelName];
  if (!model) return false;

  const tierOrder: Record<UserTier, number> = {
    free: 0,
    pro: 1,
    unlimited: 2,
  };

  return tierOrder[model.min_tier] <= tierOrder[userTier];
}

/**
 * Get upgrade suggestion when user hits model limitations
 */
export function getUpgradeSuggestion(
  desiredModel: string,
  currentTier: UserTier
): {
  needsUpgrade: boolean;
  suggestedTier?: UserTier;
  reason?: string;
} {
  const model = MODEL_CONFIGS[desiredModel];

  if (!model) {
    return { needsUpgrade: false };
  }

  if (isModelAvailableForTier(desiredModel, currentTier)) {
    return { needsUpgrade: false };
  }

  return {
    needsUpgrade: true,
    suggestedTier: model.min_tier,
    reason: `${model.displayName} is available on the ${model.min_tier} tier`,
  };
}

/**
 * Recommend tier upgrade based on usage patterns
 */
export function recommendTierUpgrade(
  currentTier: UserTier,
  tokensUsedThisMonth: number,
  requestsThisMonth: number
): {
  shouldUpgrade: boolean;
  suggestedTier?: UserTier;
  reasons: string[];
} {
  const reasons: string[] = [];

  if (currentTier === 'free') {
    // Check if user is hitting free tier limits
    if (tokensUsedThisMonth > 80000) {
      // 80% of 100k
      reasons.push('You\'re using most of your monthly tokens');
    }

    if (requestsThisMonth > 150) {
      // Frequent user
      reasons.push('You\'re a power user with many requests');
    }

    if (reasons.length > 0) {
      reasons.push('Pro tier gives you 10x more tokens and access to Claude Haiku');
      return {
        shouldUpgrade: true,
        suggestedTier: 'pro',
        reasons,
      };
    }
  }

  if (currentTier === 'pro') {
    if (tokensUsedThisMonth > 800000) {
      // 80% of 1M
      reasons.push('You\'re approaching your token limit');
      reasons.push('Unlimited tier removes all token restrictions');
    }

    if (requestsThisMonth > 1500) {
      reasons.push('You\'re making heavy use of the platform');
      reasons.push('Unlimited tier gives you access to premium models like GPT-4o and Claude Sonnet');
    }

    if (reasons.length > 0) {
      return {
        shouldUpgrade: true,
        suggestedTier: 'unlimited',
        reasons,
      };
    }
  }

  return {
    shouldUpgrade: false,
    reasons: [],
  };
}
