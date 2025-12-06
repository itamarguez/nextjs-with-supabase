# Update Stripe Price IDs in Vercel

## After creating the Stripe products, update these environment variables:

### Go to: https://vercel.com/itamarguez/nextjs-with-supabase/settings/environment-variables

### Update or add these variables:

1. **NEXT_PUBLIC_STRIPE_PRO_PRICE_ID**
   - Value: `price_XXXXX` (the price ID from "NoMoreFOMO Pro" product)
   - Environment: Production, Preview, Development

2. **NEXT_PUBLIC_STRIPE_UNLIMITED_PRICE_ID**
   - Value: `price_YYYYY` (the price ID from "NoMoreFOMO Unlimited" product)
   - Environment: Production, Preview, Development

### After updating:
- Click "Save"
- Redeploy your app (Vercel will prompt you, or go to Deployments → Redeploy)

---

## Example:

If your Pro price ID is `price_1ABC123XYZ`, set:
```
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_1ABC123XYZ
```

If your Unlimited price ID is `price_1DEF456UVW`, set:
```
NEXT_PUBLIC_STRIPE_UNLIMITED_PRICE_ID=price_1DEF456UVW
```
