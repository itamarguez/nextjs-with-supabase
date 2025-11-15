// Stripe Webhook Handler
// Handles subscription events from Stripe (payments, cancellations, etc.)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

// Create a Supabase client with service role (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log(`[Webhook] Received event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout completion
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('[Webhook] Session metadata:', session.metadata);

  const userId = session.metadata?.supabase_user_id;
  const tier = session.metadata?.tier;

  if (!userId || !tier) {
    console.error('[Webhook] Missing user ID or tier in session metadata');
    console.error('[Webhook] Received metadata:', session.metadata);
    return;
  }

  console.log(`[Webhook] Upgrading user ${userId} to ${tier} tier`);

  // First, verify the user exists
  const { data: existingUser, error: fetchError } = await supabaseAdmin
    .from('user_profiles')
    .select('id, tier, email')
    .eq('id', userId)
    .single();

  if (fetchError || !existingUser) {
    console.error('[Webhook] User not found in database:', userId);
    console.error('[Webhook] Fetch error:', fetchError);
    return;
  }

  console.log('[Webhook] Found user:', existingUser);

  // Get subscription details
  if (!session.subscription) {
    console.error('[Webhook] No subscription ID in session');
    return;
  }

  const subscription = (await stripe.subscriptions.retrieve(
    session.subscription as string
  )) as any;

  // Validate subscription data
  if (!subscription.current_period_start || !subscription.current_period_end) {
    console.error('[Webhook] Missing subscription period dates');
    return;
  }

  console.log(`[Webhook] Subscription data:`, {
    id: subscription.id,
    start: subscription.current_period_start,
    end: subscription.current_period_end,
  });

  const updateData = {
    tier: tier,
    stripe_subscription_id: subscription.id,
    subscription_start_date: new Date(
      subscription.current_period_start * 1000
    ).toISOString(),
    subscription_end_date: new Date(
      subscription.current_period_end * 1000
    ).toISOString(),
  };

  console.log('[Webhook] Attempting update with data:', updateData);

  // Update user profile
  const { data: updateResult, error } = await supabaseAdmin
    .from('user_profiles')
    .update(updateData)
    .eq('id', userId)
    .select();

  if (error) {
    console.error('[Webhook] Database update error:', error);
    throw error;
  }

  if (!updateResult || updateResult.length === 0) {
    console.error('[Webhook] Update returned no rows - user may not exist');
    return;
  }

  console.log(`[Webhook] Successfully upgraded user ${userId} to ${tier}`);
  console.log('[Webhook] Updated profile:', updateResult[0]);
}

/**
 * Handle subscription updates (renewals, plan changes)
 */
async function handleSubscriptionUpdated(subscription: any) {
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!profile) {
    console.error('[Webhook] No user found for subscription:', subscription.id);
    return;
  }

  console.log(`[Webhook] Updating subscription for user ${profile.id}`);

  // Update subscription end date
  await supabaseAdmin
    .from('user_profiles')
    .update({
      subscription_end_date: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
    })
    .eq('id', profile.id);

  console.log(`[Webhook] Subscription updated for user ${profile.id}`);
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!profile) {
    console.error('[Webhook] No user found for subscription:', subscription.id);
    return;
  }

  console.log(`[Webhook] Downgrading user ${profile.id} to free tier`);

  // Downgrade to free tier
  await supabaseAdmin
    .from('user_profiles')
    .update({
      tier: 'free',
      stripe_subscription_id: null,
      subscription_start_date: null,
      subscription_end_date: null,
    })
    .eq('id', profile.id);

  console.log(`[Webhook] User ${profile.id} downgraded to free`);
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`[Webhook] Payment failed for customer: ${invoice.customer}`);
  // TODO: Send email notification to user
  // TODO: Consider grace period before downgrading
}
