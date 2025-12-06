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
  'gemini-1.5-pro-002': [
    'gpt-4o',                // Premium tier
    'claude-3-5-sonnet-20241022', // High quality
    'claude-3-opus-20240229', // Maximum capability
  ],

  // OpenAI GPT models -> fallback to Anthropic/Google equivalents
  'gpt-4o': [
    'claude-3-5-sonnet-20241022', // Similar quality
    'gemini-1.5-pro-002',    // High capability
    'claude-3-opus-20240229', // Premium fallback
  ],
  'gpt-4o-mini': [
    'claude-3-5-haiku-20241022', // Fast, cheap
    'gemini-2.0-flash-exp',  // Similar tier
    'gpt-4o',                // Quality upgrade
  ],

  // Anthropic Claude models -> fallback to OpenAI/Google equivalents
  'claude-3-5-sonnet-20241022': [
    'gpt-4o',                // Similar quality
    'gemini-1.5-pro-002',    // High capability
    'claude-3-opus-20240229', // Upgrade fallback
  ],
  'claude-3-5-haiku-20241022': [
    'gpt-4o-mini',           // Fast, cheap
    'gemini-2.0-flash-exp',  // Similar tier
    'gpt-4o',                // Quality upgrade
  ],
  'claude-3-opus-20240229': [
    'gpt-4o',                // Premium tier
    'claude-3-5-sonnet-20241022', // Downgrade but available
    'gemini-1.5-pro-002',    // High capability
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
