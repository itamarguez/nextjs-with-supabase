// LemonSqueezy Webhook Handler
// Processes subscription events and updates user tiers in database

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';

/**
 * Verify LemonSqueezy webhook signature
 */
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return digest === signature;
}

export async function POST(request: Request) {
  try {
    // Get raw body and signature
    const body = await request.text();
    const signature = request.headers.get('x-signature');

    if (!signature) {
      console.error('[LEMONSQUEEZY] No signature header');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    if (!secret) {
      console.error('[LEMONSQUEEZY] Webhook secret not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    if (!verifySignature(body, signature, secret)) {
      console.error('[LEMONSQUEEZY] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse event
    const event = JSON.parse(body);
    const eventName = event.meta?.event_name;

    console.log('[LEMONSQUEEZY] Received webhook event:', eventName);

    // Handle subscription_created event
    if (eventName === 'subscription_created') {
      const subscription = event.data;
      const attributes = subscription.attributes;

      // Extract custom data (user_id and tier)
      const customData = attributes.first_subscription_item?.custom_data || {};
      const userId = customData.user_id;
      const tier = customData.tier; // 'pro' or 'unlimited'

      if (!userId || !tier) {
        console.error('[LEMONSQUEEZY] Missing user_id or tier in custom data:', customData);
        return NextResponse.json({ error: 'Missing required custom data' }, { status: 400 });
      }

      console.log('[LEMONSQUEEZY] Processing subscription_created:', {
        userId,
        tier,
        subscriptionId: subscription.id,
        status: attributes.status,
      });

      // Calculate period dates
      const createdAt = new Date(attributes.created_at);
      const renewsAt = attributes.renews_at ? new Date(attributes.renews_at) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default to 30 days

      // Update user tier in database using RPC function (bypasses RLS)
      const supabase = await createClient();
      const { error } = await supabase.rpc('update_user_tier_from_webhook', {
        p_user_id: userId,
        p_tier: tier,
        p_subscription_id: subscription.id,
        p_current_period_start: createdAt.toISOString(),
        p_current_period_end: renewsAt.toISOString(),
      });

      if (error) {
        console.error('[LEMONSQUEEZY] Database update error:', error);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }

      console.log('[LEMONSQUEEZY] User tier updated successfully:', { userId, tier });
    }

    // Handle subscription_updated event
    if (eventName === 'subscription_updated') {
      const subscription = event.data;
      const attributes = subscription.attributes;
      const customData = attributes.first_subscription_item?.custom_data || {};
      const userId = customData.user_id;

      console.log('[LEMONSQUEEZY] Processing subscription_updated:', {
        userId,
        subscriptionId: subscription.id,
        status: attributes.status,
        cancelled: attributes.cancelled,
      });

      // Handle subscription cancellation
      if (attributes.cancelled) {
        console.log('[LEMONSQUEEZY] Subscription cancelled:', userId);
        // You could downgrade to free tier here, but keeping their tier until renewal_at is common
        // Optionally: Update tier to 'free' when subscription expires
      }

      // Handle subscription reactivation
      if (attributes.status === 'active' && !attributes.cancelled) {
        console.log('[LEMONSQUEEZY] Subscription reactivated:', userId);
      }
    }

    // Handle subscription_cancelled event
    if (eventName === 'subscription_cancelled') {
      const subscription = event.data;
      const customData = subscription.attributes.first_subscription_item?.custom_data || {};
      const userId = customData.user_id;

      console.log('[LEMONSQUEEZY] Processing subscription_cancelled:', {
        userId,
        subscriptionId: subscription.id,
      });

      // Optionally downgrade user to free tier immediately
      // Or let them keep access until current period ends
    }

    // Handle subscription_expired event
    if (eventName === 'subscription_expired') {
      const subscription = event.data;
      const customData = subscription.attributes.first_subscription_item?.custom_data || {};
      const userId = customData.user_id;

      console.log('[LEMONSQUEEZY] Processing subscription_expired:', {
        userId,
        subscriptionId: subscription.id,
      });

      // Downgrade to free tier
      const supabase = await createClient();
      await supabase.rpc('update_user_tier_from_webhook', {
        p_user_id: userId,
        p_tier: 'free',
        p_subscription_id: null,
        p_current_period_start: new Date().toISOString(),
        p_current_period_end: new Date().toISOString(),
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[LEMONSQUEEZY] Webhook processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Webhook error: ${errorMessage}` }, { status: 500 });
  }
}
