// LemonSqueezy Checkout Session Creation
// Creates a checkout session for Pro or Unlimited tier subscriptions

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import { initializeLemonSqueezy, getLemonSqueezyConfig } from '@/lib/lemonsqueezy/client';

export async function POST(request: Request) {
  try {
    const { tier } = await request.json();

    // Validate tier
    if (tier !== 'pro' && tier !== 'unlimited') {
      return NextResponse.json(
        { error: 'Invalid tier. Must be "pro" or "unlimited"' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize LemonSqueezy client
    initializeLemonSqueezy();
    const config = getLemonSqueezyConfig();

    // Get variant ID based on tier
    const variantId = tier === 'pro' ? config.proVariantId : config.unlimitedVariantId;

    console.log('[LEMONSQUEEZY] Creating checkout:', {
      userId: user.id,
      email: user.email,
      tier,
      variantId,
    });

    // Create checkout session
    const checkout = await createCheckout(config.storeId, variantId, {
      checkoutData: {
        email: user.email || undefined,
        custom: {
          user_id: user.id,
          tier: tier, // Pass tier in custom data for webhook
        },
      },
      productOptions: {
        redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.llm-fomo.com'}/upgrade/success`,
      },
    });

    // Log the full response for debugging
    console.log('[LEMONSQUEEZY] Full checkout response:', JSON.stringify(checkout, null, 2));

    if (!checkout.data) {
      console.error('[LEMONSQUEEZY] Failed to create checkout - no data');
      throw new Error('Failed to create checkout session');
    }

    // Try multiple possible response structures
    const checkoutData = checkout.data as any;
    const checkoutUrl = checkoutData.attributes?.url || checkoutData.url || (checkoutData as any);

    console.log('[LEMONSQUEEZY] Checkout data:', JSON.stringify(checkoutData, null, 2));
    console.log('[LEMONSQUEEZY] Extracted URL:', checkoutUrl);

    if (!checkoutUrl || typeof checkoutUrl !== 'string') {
      console.error('[LEMONSQUEEZY] No valid checkout URL found');
      throw new Error('No checkout URL returned');
    }

    console.log('[LEMONSQUEEZY] Checkout created successfully:', checkoutUrl);

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('[LEMONSQUEEZY] Checkout creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to create checkout: ${errorMessage}` },
      { status: 500 }
    );
  }
}
