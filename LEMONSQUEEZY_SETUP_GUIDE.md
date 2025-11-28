# LemonSqueezy Setup Guide

## 🎯 Step-by-Step Setup Instructions

### Step 1: Create LemonSqueezy Account (5 minutes)

1. **Go to**: https://app.lemonsqueezy.com/register
2. **Sign up** with your email and password
3. **Verify your email** (check inbox)
4. **Log in** to your new account

---

### Step 2: Create Your Store (5 minutes)

1. **Click** "Create a store" (first time setup)
2. **Fill in store details**:
   - Store name: `NoMoreFOMO`
   - Store slug: `nomorefomo` (this becomes: nomorefomo.lemonsqueezy.com)
   - Currency: `USD`
3. **Complete business information**:
   - Your name/business name
   - Address (your Israeli address is fine!)
   - Tax ID (optional for now)
4. **Save store**

**Important**: Copy your **Store ID** - you'll need it later
- Find it in: Settings → General → Store ID (it's a number like `12345`)

---

### Step 3: Create Products (15 minutes)

#### Product 1: NoMoreFOMO Pro

1. **Go to**: Products → New Product
2. **Fill in details**:
   - Product name: `NoMoreFOMO Pro`
   - Description: `Access to premium AI models including GPT-4o and Claude Sonnet with intelligent routing`
3. **Pricing**:
   - Click "Add variant"
   - Variant name: `Monthly`
   - Price: `$12.00`
   - Billing type: `Subscription`
   - Billing interval: `Monthly`
4. **Save product**
5. **Copy the Variant ID**:
   - Click on the variant you just created
   - Look for the ID in the URL or variant details (looks like `123456`)
   - Save this as `LEMONSQUEEZY_PRO_VARIANT_ID`

#### Product 2: NoMoreFOMO Unlimited

1. **Create another product**
2. **Fill in details**:
   - Product name: `NoMoreFOMO Unlimited`
   - Description: `Unlimited access to all premium AI models including GPT-5, Claude 4.5, and Gemini 3 Pro`
3. **Pricing**:
   - Add variant
   - Variant name: `Monthly`
   - Price: `$49.00`
   - Billing type: `Subscription`
   - Billing interval: `Monthly`
4. **Save product**
5. **Copy the Variant ID**:
   - Save this as `LEMONSQUEEZY_UNLIMITED_VARIANT_ID`

---

### Step 4: Get API Key (2 minutes)

1. **Go to**: Settings → API
2. **Click**: "Create API Key"
3. **Name it**: `NoMoreFOMO Production`
4. **Copy the API key** (starts with `lm_...`)
   - **IMPORTANT**: This is shown only once! Save it securely.
   - Save this as `LEMONSQUEEZY_API_KEY`

---

### Step 5: Configure Webhook (10 minutes)

1. **Go to**: Settings → Webhooks
2. **Click**: "+ Create webhook"
3. **Configure webhook**:
   - **URL**: `https://www.llm-fomo.com/api/lemonsqueezy/webhook`
   - **Events to subscribe to** (select these 4):
     - ✅ `subscription_created`
     - ✅ `subscription_updated`
     - ✅ `subscription_cancelled`
     - ✅ `subscription_expired`
   - **Signing secret**: This will be auto-generated
4. **Save webhook**
5. **Copy the Signing Secret**:
   - Click on the webhook you just created
   - Find "Signing secret" (looks like a long random string)
   - Save this as `LEMONSQUEEZY_WEBHOOK_SECRET`

---

### Step 6: Update Vercel Environment Variables (10 minutes)

1. **Go to**: https://vercel.com/itamarguez/nextjs-with-supabase/settings/environment-variables

2. **Delete old Stripe variables** (if they exist):
   - Click the "..." menu next to each variable → Delete
   - Delete these:
     - `STRIPE_SECRET_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`
     - `NEXT_PUBLIC_STRIPE_UNLIMITED_PRICE_ID`

3. **Add new LemonSqueezy variables**:

   Click "Add New" for each:

   **Variable 1:**
   - Name: `LEMONSQUEEZY_API_KEY`
   - Value: `lm_...` (the API key from Step 4)
   - Environment: Production, Preview, Development (check all 3)

   **Variable 2:**
   - Name: `LEMONSQUEEZY_WEBHOOK_SECRET`
   - Value: (the signing secret from Step 5)
   - Environment: Production, Preview, Development

   **Variable 3:**
   - Name: `LEMONSQUEEZY_STORE_ID`
   - Value: (the store ID from Step 2, just the number)
   - Environment: Production, Preview, Development

   **Variable 4:**
   - Name: `NEXT_PUBLIC_LEMONSQUEEZY_PRO_VARIANT_ID`
   - Value: (the Pro variant ID from Step 3)
   - Environment: Production, Preview, Development

   **Variable 5:**
   - Name: `NEXT_PUBLIC_LEMONSQUEEZY_UNLIMITED_VARIANT_ID`
   - Value: (the Unlimited variant ID from Step 3)
   - Environment: Production, Preview, Development

4. **Save all variables**

5. **Redeploy your app**:
   - Vercel will prompt you to redeploy
   - OR go to Deployments → click "..." → Redeploy

---

### Step 7: Update Local Environment (Optional - for local development)

Create or update `.env.local` in your project root:

```env
# LemonSqueezy Configuration
LEMONSQUEEZY_API_KEY=lm_your_api_key_here
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret_here
LEMONSQUEEZY_STORE_ID=12345
NEXT_PUBLIC_LEMONSQUEEZY_PRO_VARIANT_ID=123456
NEXT_PUBLIC_LEMONSQUEEZY_UNLIMITED_VARIANT_ID=789012

# Site URL (for redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## ✅ Verification Checklist

Before going live, verify:

- [ ] LemonSqueezy account created and verified
- [ ] Store created with correct name and currency (USD)
- [ ] Pro product created ($12/month)
- [ ] Unlimited product created ($49/month)
- [ ] Both variant IDs copied
- [ ] API key generated and copied
- [ ] Webhook created with correct URL: `https://www.llm-fomo.com/api/lemonsqueezy/webhook`
- [ ] Webhook subscribed to 4 events (created, updated, cancelled, expired)
- [ ] Webhook signing secret copied
- [ ] All 5 environment variables added to Vercel
- [ ] App redeployed to Vercel
- [ ] Old Stripe variables deleted (optional but recommended)

---

## 🧪 Testing

### Test in LemonSqueezy Test Mode

1. **Go to your LemonSqueezy dashboard**
2. **Toggle "Test mode"** (switch in top right)
3. **In test mode**:
   - Go to your live site: https://www.llm-fomo.com
   - Sign up with a new Google account
   - Click "Upgrade to Pro"
   - Use test card: `4242 4242 4242 4242`
   - Complete checkout
4. **Verify**:
   - Success page shows "Welcome to Pro!"
   - Chat page header shows "Pro" tier
5. **Repeat for Unlimited tier**:
   - Use different account
   - Test Unlimited upgrade

### Check Webhook Delivery

1. **Go to**: Settings → Webhooks → Your webhook
2. **Click**: "Recent deliveries"
3. **Verify**:
   - You see `subscription_created` event
   - Status is `200 OK`
   - Response shows `{"received":true}`

---

## 🎯 Environment Variables Reference

| Variable | Where to Find | Example |
|----------|---------------|---------|
| `LEMONSQUEEZY_API_KEY` | Settings → API → Create API Key | `lm_abc123...` |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Settings → Webhooks → Your webhook → Signing secret | `wh_sec_xyz789...` |
| `LEMONSQUEEZY_STORE_ID` | Settings → General → Store ID | `12345` |
| `NEXT_PUBLIC_LEMONSQUEEZY_PRO_VARIANT_ID` | Products → NoMoreFOMO Pro → Variant ID | `123456` |
| `NEXT_PUBLIC_LEMONSQUEEZY_UNLIMITED_VARIANT_ID` | Products → NoMoreFOMO Unlimited → Variant ID | `789012` |

---

## 🆘 Troubleshooting

### Webhook returns 401/403
- Check webhook signing secret is correct
- Make sure it's copied exactly (no spaces)

### Webhook returns 500
- Check all environment variables are set in Vercel
- Redeploy after adding variables
- Check Vercel logs for detailed error

### Checkout session fails to create
- Verify API key is correct
- Verify variant IDs are correct (numbers, not product IDs)
- Check that store ID is correct

### Tier not updating after payment
- Check webhook is configured with correct URL
- Verify webhook events are subscribed
- Check webhook delivery logs in LemonSqueezy
- Check database has `update_user_tier_from_webhook` function

---

## 🚀 Going Live

1. **Connect payout method**:
   - Go to Settings → Payouts
   - Add your bank account or PayPal
   - For Israel: PayPal is easiest, or use international bank account

2. **Verify business details**:
   - Settings → Business
   - Ensure all information is accurate

3. **Turn OFF test mode**:
   - Toggle test mode OFF in top right
   - Now you can accept real payments!

4. **Start accepting payments**:
   - Your checkout links will now charge real money
   - LemonSqueezy handles all tax compliance automatically

---

## 📞 Support

- **LemonSqueezy Docs**: https://docs.lemonsqueezy.com
- **LemonSqueezy Support**: support@lemonsqueezy.com
- **Community**: https://discord.gg/lemonsqueezy

---

**You're all set!** 🎉

LemonSqueezy is now configured and ready to accept payments from anywhere in the world, including Israel!
