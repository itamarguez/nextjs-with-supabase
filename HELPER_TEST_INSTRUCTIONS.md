# Helper Test Instructions - Stripe Upgrade Flow

## What We Need You To Test

We fixed a critical Stripe webhook issue and need to verify that **tier assignments** work correctly when users upgrade to Pro or Unlimited.

---

## Test 1: Pro Tier Upgrade ($12/month)

### Step 1: Sign Up
1. **Open incognito/private window**
2. **Go to**: https://www.llm-fomo.com/auth/sign-up
3. **Click**: "Continue with Google"
4. **Sign in** with any Google account

### Step 2: Upgrade to Pro
5. **You'll be redirected to /chat** after signup
6. **Click** the "Upgrade" button in the header (top right)
7. **Click**: "Upgrade to Pro" ($12/month)

### Step 3: Complete Payment
8. **Stripe checkout will open**
9. **Fill in**:
   - Email: (any test email)
   - Card number: `4242 4242 4242 4242` (Stripe test card - won't charge real money!)
   - Expiry: Any future date (e.g., `12/30`)
   - CVC: Any 3 digits (e.g., `123`)
   - Name: Your name
   - Billing address: Any address
10. **Click**: "Subscribe"

### Step 4: Verify Success
11. **Success page should show**: "Welcome to **Pro**!"
12. **Verify it does NOT say**: "Welcome to Unlimited"
13. **Go to**: https://www.llm-fomo.com/chat
14. **Check header** (top right) - should show "Pro" tier

### Step 5: Report Results
**Tell us**:
- ✅ Success page showed "Welcome to Pro!" (correct)
- ✅ Chat page header shows "Pro" tier (correct)
- OR
- ❌ Success page showed wrong tier name
- ❌ Chat page header shows wrong tier

---

## Test 2: Unlimited Tier Upgrade ($49/month)

### Step 1: Sign Up (New Account)
1. **Open NEW incognito/private window** (or different browser)
2. **Go to**: https://www.llm-fomo.com/auth/sign-up
3. **Click**: "Continue with Google"
4. **Sign in** with a **DIFFERENT** Google account

### Step 2: Upgrade to Unlimited
5. **After redirected to /chat**, click "Upgrade" button
6. **Click**: "Upgrade to Unlimited" ($49/month)

### Step 3: Complete Payment
7. **Stripe checkout will open**
8. **Fill in**:
   - Email: (any test email)
   - Card number: `4242 4242 4242 4242` (same test card)
   - Expiry: `12/30`
   - CVC: `123`
   - Name: Your name
   - Billing address: Any address
9. **Click**: "Subscribe"

### Step 4: Verify Success
10. **Success page should show**: "Welcome to **Unlimited**!"
11. **Verify it does NOT say**: "Welcome to Pro"
12. **Go to**: https://www.llm-fomo.com/chat
13. **Check header** (top right) - should show "Unlimited" tier

### Step 5: Report Results
**Tell us**:
- ✅ Success page showed "Welcome to Unlimited!" (correct)
- ✅ Chat page header shows "Unlimited" tier (correct)
- OR
- ❌ Success page showed wrong tier name
- ❌ Chat page header shows wrong tier

---

## Important Notes

- **Stripe test card**: `4242 4242 4242 4242` won't charge real money! It's for testing only.
- **Use different Google accounts**: Test 1 and Test 2 should use different accounts.
- **Incognito windows**: Use fresh incognito windows to avoid session conflicts.

---

## What We're Testing

**Before the fix**: Users clicking "Upgrade to Unlimited" would get "Pro" tier assigned (wrong!)

**After the fix**: Stripe webhook now correctly receives the tier from metadata and assigns it properly.

---

## Questions?

If you encounter any issues during testing, take a screenshot and share:
1. What tier you clicked (Pro or Unlimited)
2. What the success page showed
3. What the chat page header shows

Thank you for helping test! 🙏
