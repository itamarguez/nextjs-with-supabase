# Stripe → LemonSqueezy Migration Plan

## 🚨 WHY MIGRATE?

### Critical Issue: Israel Not Supported by Stripe
**Stripe does NOT officially support Israeli businesses creating merchant accounts.**

**Your options with Stripe**:
1. ❌ **Create US LLC** + US bank account (complex, expensive, risky)
2. ❌ **Stay in test mode forever** (can't accept real payments)
3. ❌ **Risk account suspension** when Stripe discovers your location

**LemonSqueezy solves this**:
- ✅ **Works globally** - No country restrictions
- ✅ **Merchant of Record** - Handles ALL tax compliance (VAT, sales tax, GST)
- ✅ **Simple setup** - No need for US entity or bank account
- ✅ **Built for SaaS** - Subscription management included

---

## 💰 PRICING COMPARISON

### Stripe (What you'd pay)
- Base: **2.9% + $0.30** per transaction
- Subscriptions: **+0.5%** on top
- International cards: **+1%**
- Tax calculation: **+0.5%** (Stripe Tax add-on)
- **Total**: ~4.9% + $0.30 per transaction

### LemonSqueezy (All-inclusive)
- **5% + $0.50** per transaction
- **Includes**:
  - Tax compliance (automatic VAT/sales tax calculation & filing)
  - Subscription management
  - Failed payment recovery (dunning)
  - Customer portal
  - Webhooks
  - Email receipts

**Verdict**: LemonSqueezy is simpler and similar in cost, but handles compliance for you.

---

## 📊 FEATURE COMPARISON

| Feature | Stripe | LemonSqueezy |
|---------|--------|--------------|
| **Supported in Israel** | ❌ No | ✅ Yes |
| **Tax compliance** | Manual (or pay extra) | ✅ Automatic (MoR) |
| **Setup time** | 2 days (complex) | 2 hours (simple) |
| **Subscriptions** | ✅ Yes | ✅ Yes |
| **Webhooks** | ✅ Yes | ✅ Yes |
| **Test mode** | ✅ Yes | ✅ Yes |
| **Customer portal** | Extra setup | ✅ Included |
| **Pricing** | 2.9% + 30¢ + extras | 5% + 50¢ (all-in) |

---

## 🎯 MIGRATION STRATEGY

### Option A: **Migrate Before Launch** (Recommended)
**Pros**:
- No need to maintain two systems
- Start with the right foundation
- No customer migration needed

**Cons**:
- Delays launch by ~4-6 hours

### Option B: **Launch with Stripe, Migrate Later**
**Pros**:
- Launch immediately

**Cons**:
- **Risky**: Stripe may suspend your account when you go live
- Need to migrate existing customers
- Maintain two codebases temporarily

**RECOMMENDATION**: **Migrate now** - 4-6 hours of work is better than risking account suspension.

---

## 🛠️ MIGRATION PLAN (Simple & Thorough)

### Phase 1: Setup LemonSqueezy Account (30 minutes)

1. **Create account**: https://app.lemonsqueezy.com/register
   - Use your email and create password
   - Verify email

2. **Setup store**:
   - Store name: "NoMoreFOMO"
   - Store URL: `nomorefomo` (becomes nomorefomo.lemonsqueezy.com)
   - Currency: USD

3. **Business details**:
   - Add your Israeli business info
   - LemonSqueezy handles tax compliance, so you don't need a US entity

4. **Payout method**:
   - Connect your bank account or PayPal
   - LemonSqueezy supports international payouts

---

### Phase 2: Create Products (15 minutes)

1. **Create "NoMoreFOMO Pro" product**:
   - Go to Products → New Product
   - Name: "NoMoreFOMO Pro"
   - Price: $12/month
   - Recurring: Yes (monthly)
   - Description: "1M tokens per month, access to GPT-4o & Claude Sonnet, smart routing"

2. **Create "NoMoreFOMO Unlimited" product**:
   - Name: "NoMoreFOMO Unlimited"
   - Price: $49/month
   - Recurring: Yes (monthly)
   - Description: "10M tokens per month, access to all premium models (GPT-5, Claude 4.5, Gemini 3 Pro)"

3. **Save variant IDs**:
   - Each product has a "variant ID" (like Stripe price IDs)
   - Copy both variant IDs - you'll need them for environment variables

---

### Phase 3: Get API Keys (5 minutes)

1. **Go to Settings → API**
2. **Copy**:
   - API Key (for backend requests)
   - Webhook Secret (for webhook signature verification)

---

### Phase 4: Code Changes (2-3 hours)

#### Step 1: Install LemonSqueezy SDK

```bash
npm install @lemonsqueezy/lemonsqueezy.js
```

#### Step 2: Update Environment Variables

**Remove (Stripe)**:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_UNLIMITED_PRICE_ID=price_...
```

**Add (LemonSqueezy)**:
```env
LEMONSQUEEZY_API_KEY=your_api_key
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_LEMONSQUEEZY_PRO_VARIANT_ID=123456
NEXT_PUBLIC_LEMONSQUEEZY_UNLIMITED_VARIANT_ID=789012
LEMONSQUEEZY_STORE_ID=your_store_id
```

#### Step 3: Create LemonSqueezy Client

**Create file**: `lib/lemonsqueezy/client.ts`
```typescript
import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

export function getLemonSqueezyClient() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) {
    throw new Error('LEMONSQUEEZY_API_KEY not configured');
  }
  lemonSqueezySetup({ apiKey });
}
```

#### Step 4: Update Checkout API

**Replace file**: `app/api/lemonsqueezy/create-checkout/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import { getLemonSqueezyClient } from '@/lib/lemonsqueezy/client';

export async function POST(request: Request) {
  try {
    const { tier } = await request.json();

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get variant ID based on tier
    const variantId = tier === 'pro'
      ? process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_VARIANT_ID
      : process.env.NEXT_PUBLIC_LEMONSQUEEZY_UNLIMITED_VARIANT_ID;

    if (!variantId) {
      return NextResponse.json({ error: 'Product not configured' }, { status: 500 });
    }

    // Initialize LemonSqueezy
    getLemonSqueezyClient();

    // Create checkout session
    const storeId = process.env.LEMONSQUEEZY_STORE_ID!;
    const checkout = await createCheckout(storeId, variantId, {
      checkoutData: {
        email: user.email,
        custom: {
          user_id: user.id,
          tier: tier, // Pass tier in custom data
        },
      },
      productOptions: {
        redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/upgrade/success`,
      },
    });

    if (!checkout.data) {
      throw new Error('Failed to create checkout');
    }

    return NextResponse.json({ url: checkout.data.attributes.url });
  } catch (error) {
    console.error('LemonSqueezy checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}
```

#### Step 5: Update Webhook Handler

**Replace file**: `app/api/lemonsqueezy/webhook/route.ts`

```typescript
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Verify webhook signature
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(body).digest('hex');

    if (digest !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    // Handle subscription created event
    if (event.meta.event_name === 'subscription_created') {
      const subscription = event.data;
      const customData = subscription.attributes.first_subscription_item.custom_data;

      const userId = customData.user_id;
      const tier = customData.tier; // 'pro' or 'unlimited'

      console.log('[LEMONSQUEEZY] Subscription created:', { userId, tier });

      // Update user tier in database
      const supabase = await createClient();
      const { error } = await supabase.rpc('update_user_tier_from_webhook', {
        p_user_id: userId,
        p_tier: tier,
        p_subscription_id: subscription.id,
        p_current_period_start: new Date(subscription.attributes.created_at),
        p_current_period_end: new Date(subscription.attributes.renews_at),
      });

      if (error) {
        console.error('[LEMONSQUEEZY] Database update error:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }

      console.log('[LEMONSQUEEZY] User tier updated successfully');
    }

    // Handle subscription updated event
    if (event.meta.event_name === 'subscription_updated') {
      const subscription = event.data;
      const userId = subscription.attributes.first_subscription_item.custom_data.user_id;

      // Handle cancellations, upgrades, etc.
      if (subscription.attributes.cancelled) {
        console.log('[LEMONSQUEEZY] Subscription cancelled:', userId);
        // Optionally downgrade to free tier
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[LEMONSQUEEZY] Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
```

#### Step 6: Update Frontend (Upgrade Page)

**Update file**: `app/upgrade/page.tsx`

Change the API endpoint:
```typescript
// OLD (Stripe):
const response = await fetch('/api/stripe/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tier }),
});

// NEW (LemonSqueezy):
const response = await fetch('/api/lemonsqueezy/create-checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tier }),
});
```

#### Step 7: Update Middleware

**Update file**: `middleware.ts`

Change the excluded route:
```typescript
// OLD:
"/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"

// NEW:
"/((?!_next/static|_next/image|favicon.ico|api/lemonsqueezy/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
```

---

### Phase 5: Configure Webhook in LemonSqueezy (10 minutes)

1. **Go to LemonSqueezy Dashboard** → Settings → Webhooks
2. **Click "+" to add webhook**
3. **Configure**:
   - URL: `https://www.llm-fomo.com/api/lemonsqueezy/webhook`
   - Events: Select:
     - `subscription_created`
     - `subscription_updated`
     - `subscription_cancelled`
   - Signing secret: Copy this (use it as `LEMONSQUEEZY_WEBHOOK_SECRET`)
4. **Save webhook**

---

### Phase 6: Update Vercel Environment Variables (5 minutes)

1. **Go to**: https://vercel.com/itamarguez/nextjs-with-supabase/settings/environment-variables

2. **Delete Stripe variables**:
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SECRET
   - NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
   - NEXT_PUBLIC_STRIPE_UNLIMITED_PRICE_ID

3. **Add LemonSqueezy variables**:
   - LEMONSQUEEZY_API_KEY
   - LEMONSQUEEZY_WEBHOOK_SECRET
   - LEMONSQUEEZY_STORE_ID
   - NEXT_PUBLIC_LEMONSQUEEZY_PRO_VARIANT_ID
   - NEXT_PUBLIC_LEMONSQUEEZY_UNLIMITED_VARIANT_ID

4. **Redeploy** (Vercel will prompt you)

---

### Phase 7: Testing (30 minutes)

1. **Test Pro tier**:
   - Sign up with new account
   - Click "Upgrade to Pro"
   - Use LemonSqueezy test card: `4242 4242 4242 4242`
   - Verify success page shows "Pro"

2. **Test Unlimited tier**:
   - Sign up with different account
   - Click "Upgrade to Unlimited"
   - Use test card
   - Verify success page shows "Unlimited"

3. **Test webhook delivery**:
   - Check LemonSqueezy webhook logs
   - Should show "200 OK" for all events

---

## 🎯 TOTAL TIME ESTIMATE

| Phase | Time |
|-------|------|
| Setup LemonSqueezy account | 30 min |
| Create products | 15 min |
| Get API keys | 5 min |
| Code changes | 2-3 hours |
| Configure webhook | 10 min |
| Update Vercel env vars | 5 min |
| Testing | 30 min |
| **TOTAL** | **4-6 hours** |

---

## ✅ BENEFITS OF MIGRATING

1. **Legal & Compliant**: Works from Israel without workarounds
2. **Tax Handling**: Automatic VAT/sales tax calculation & filing
3. **Simpler Code**: 2 hours vs 2 days of integration work
4. **No Risk**: No account suspension risk
5. **Better Support**: LemonSqueezy built for indie SaaS founders

---

## 📝 FILES TO DELETE (After Migration)

- ❌ `app/api/stripe/create-checkout-session/route.ts`
- ❌ `app/api/stripe/webhook/route.ts`
- ❌ `UPDATE_STRIPE_PRICE_IDS.md`
- ❌ Any Stripe-related SQL files

---

## 🚀 POST-MIGRATION CHECKLIST

- [ ] Remove Stripe SDK: `npm uninstall stripe @stripe/stripe-js`
- [ ] Delete Stripe dashboard (or keep for reference)
- [ ] Update `PRE_LAUNCH_FINAL_CHECKLIST.md` to reflect LemonSqueezy
- [ ] Update `LAUNCH_STATUS.md` with new payment provider
- [ ] Test complete upgrade flow (Pro & Unlimited)
- [ ] Monitor LemonSqueezy webhook logs for first week

---

## 💡 DECISION TIME

### Should you migrate now?

**YES, if**:
- ✅ You're in Israel (or unsupported country)
- ✅ You want tax compliance handled automatically
- ✅ You want to avoid legal/account suspension risk

**NO, if**:
- ❌ You have a US LLC + US bank account already
- ❌ You're in a Stripe-supported country
- ❌ You need Stripe-specific features

**For your situation (Israel)**: **MIGRATE NOW** is the clear recommendation.

---

## 🆘 NEED HELP?

If you want me to implement this migration, just say:
**"Let's migrate to LemonSqueezy"**

I'll handle all the code changes, configuration, and testing. Estimated time: 4-6 hours total.
