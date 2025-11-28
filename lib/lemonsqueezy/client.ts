// LemonSqueezy API client configuration
import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

/**
 * Initialize LemonSqueezy client with API key
 * Call this before making any LemonSqueezy API requests
 */
export function initializeLemonSqueezy() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;

  if (!apiKey) {
    throw new Error('LEMONSQUEEZY_API_KEY not configured');
  }

  lemonSqueezySetup({ apiKey });
}

/**
 * Get environment-specific configuration
 */
export function getLemonSqueezyConfig() {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID;
  const proVariantId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_VARIANT_ID;
  const unlimitedVariantId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_UNLIMITED_VARIANT_ID;
  const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (!storeId || !proVariantId || !unlimitedVariantId) {
    throw new Error('LemonSqueezy configuration incomplete. Check environment variables.');
  }

  return {
    storeId,
    proVariantId,
    unlimitedVariantId,
    webhookSecret,
  };
}
