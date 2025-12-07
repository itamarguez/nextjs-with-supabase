// NoMoreFOMO Model Failover System
// Handles automatic fallback to equivalent models when API failures occur

import { MODEL_CONFIGS } from './models';

/**
 * Model equivalency groups - models that can substitute for each other
 * Organized by capability tier and use case
 */
export const MODEL_FAILOVER_CHAINS: Record<string, string[]> = {
  // Google Gemini models -> fallback to OpenAI/Anthropic equivalents
  'gemini-2.0-flash-exp': [
    'gpt-4o-mini',           // Cost-efficient first (most queries are simple)
    'gpt-4o',                // Advanced reasoning if needed
    'claude-3-5-sonnet-20241022', // High quality final fallback
  ],
  'gemini-2.5-pro': [
    'gpt-5',                 // Similar premium tier
    'claude-sonnet-4-5-20250929', // Best coding model
    'gemini-3-pro',          // Upgrade fallback
  ],
  'gemini-3-pro': [
    'claude-sonnet-4-5-20250929', // Best coding alternative
    'gpt-5',                 // Premium tier
    'claude-opus-4-5-20251101', // Maximum capability
  ],

  // OpenAI GPT models -> fallback to Anthropic/Google equivalents
  'gpt-4o': [
    'claude-3-5-sonnet-20241022', // Similar quality
    'gpt-5-mini',            // Upgrade option
    'gpt-5',                 // Premium fallback
  ],
  'gpt-4o-mini': [
    'claude-3-5-haiku-20241022', // Fast, cheap
    'gemini-2.0-flash-exp',  // Similar tier
    'gpt-4o',                // Quality upgrade
  ],
  'gpt-5-mini': [
    'gpt-5',                 // Upgrade to full GPT-5
    'claude-sonnet-4-5-20250929', // Best coding model
    'gemini-2.5-pro',        // Similar tier
  ],
  'gpt-5': [
    'claude-sonnet-4-5-20250929', // Best coding alternative
    'gemini-3-pro',          // Top overall model
    'gpt-5.1',               // Reasoning upgrade
  ],
  'gpt-5.1': [
    'claude-opus-4-5-20251101', // Similar reasoning capability
    'gpt-5',                 // Downgrade to standard GPT-5
    'o1',                    // Alternative reasoning model
  ],

  // Anthropic Claude models -> fallback to OpenAI/Google equivalents
  'claude-3-5-sonnet-20241022': [
    'claude-sonnet-4-5-20250929', // Upgrade to 4.5
    'gpt-4o',                // Similar quality
    'gpt-5',                 // Premium fallback
  ],
  'claude-3-5-haiku-20241022': [
    'gpt-4o-mini',           // Fast, cheap
    'gemini-2.0-flash-exp',  // Similar tier
    'gpt-4o',                // Quality upgrade
  ],
  'claude-sonnet-4-5-20250929': [
    'gemini-3-pro',          // Top overall model
    'gpt-5',                 // Premium tier
    'claude-opus-4-5-20251101', // Upgrade fallback
  ],
  'claude-opus-4-5-20251101': [
    'gpt-5.1',               // Similar reasoning capability
    'claude-sonnet-4-5-20250929', // Downgrade but available
    'o1',                    // Alternative reasoning model
  ],

  // Reasoning models
  'o1-mini': [
    'gpt-5.1',               // Better reasoning model
    'claude-sonnet-4-5-20250929', // Best coding model
    'gpt-5',                 // Premium fallback
  ],
  'o1': [
    'claude-opus-4-5-20251101', // Similar advanced reasoning
    'gpt-5.1',               // Alternative reasoning
    'claude-sonnet-4-5-20250929', // Downgrade but available
  ],
};

/**
 * Error types that should trigger failover
 */
export enum FailoverReason {
  RATE_LIMIT = 'rate_limit',         // 429 errors
  SERVICE_UNAVAILABLE = 'service_unavailable', // 503 errors
  TIMEOUT = 'timeout',               // Request timeout
  INVALID_API_KEY = 'invalid_api_key', // 401/403 errors
  UNKNOWN_ERROR = 'unknown_error',   // Other errors
}

/**
 * Detect if an error should trigger failover
 */
export function shouldFailover(error: Error): { should: boolean; reason: FailoverReason } {
  const errorMessage = error.message.toLowerCase();

  // Rate limit errors (429)
  if (errorMessage.includes('429') || errorMessage.includes('rate limit') || errorMessage.includes('quota exceeded')) {
    return { should: true, reason: FailoverReason.RATE_LIMIT };
  }

  // Service unavailable (503)
  if (errorMessage.includes('503') || errorMessage.includes('service unavailable')) {
    return { should: true, reason: FailoverReason.SERVICE_UNAVAILABLE };
  }

  // Timeout errors
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return { should: true, reason: FailoverReason.TIMEOUT };
  }

  // Authentication errors (401, 403)
  if (errorMessage.includes('401') || errorMessage.includes('403') ||
      errorMessage.includes('unauthorized') || errorMessage.includes('forbidden') ||
      errorMessage.includes('api key')) {
    return { should: true, reason: FailoverReason.INVALID_API_KEY };
  }

  // Unknown errors - don't failover for these (might be user input errors)
  return { should: false, reason: FailoverReason.UNKNOWN_ERROR };
}

/**
 * Get next fallback model in the chain
 */
export function getNextFallbackModel(
  currentModel: string,
  attemptedModels: string[] = []
): string | null {
  const fallbackChain = MODEL_FAILOVER_CHAINS[currentModel];

  if (!fallbackChain || fallbackChain.length === 0) {
    return null; // No fallback available for this model
  }

  // Find the first model in the chain that hasn't been attempted yet
  for (const fallbackModel of fallbackChain) {
    if (!attemptedModels.includes(fallbackModel)) {
      // Verify the fallback model exists in our config
      if (MODEL_CONFIGS[fallbackModel]) {
        return fallbackModel;
      }
    }
  }

  return null; // All fallback options exhausted
}

/**
 * Failover event for logging
 */
export interface FailoverEvent {
  originalModel: string;
  fallbackModel: string;
  reason: FailoverReason;
  attemptNumber: number;
  timestamp: Date;
  userId?: string;
  conversationId?: string;
}

/**
 * Log failover event (to be stored in database)
 */
export async function logFailoverEvent(event: FailoverEvent): Promise<void> {
  // Log to console for now
  console.log(`[FAILOVER] ${event.originalModel} -> ${event.fallbackModel} (${event.reason}) attempt ${event.attemptNumber}`);

  // TODO: Store in database for admin dashboard monitoring
  // This would involve creating a failover_logs table in Supabase
}
