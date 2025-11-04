# Google OAuth Consent Screen Setup Guide

## Step-by-Step Instructions

### Part 1: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project**
   - Click the project dropdown at the top
   - Click "New Project"
   - Name: "NoMoreFOMO" (or your preferred name)
   - Click "Create"

---

### Part 2: Configure OAuth Consent Screen

1. **Navigate to OAuth Consent Screen**
   - In the left sidebar, go to **APIs & Services** → **OAuth consent screen**

2. **Choose User Type**
   - Select **External** (allows any Google user to sign in)
   - Click **Create**

3. **App Information**
   Fill in the following:

   **App name:**
   ```
   NoMoreFOMO
   ```

   **User support email:**
   ```
   [Your email address]
   ```

   **App logo:** (Optional but recommended)
   - Upload a 120x120px logo
   - PNG or JPG format

   **App domain** (Required):

   **Application home page:**
   ```
   https://your-domain.com
   ```
   (Replace with your actual domain, or use `http://localhost:3000` for testing)

   **Application privacy policy link:**
   ```
   https://your-domain.com/privacy-policy
   ```
   OR for local testing:
   ```
   http://localhost:3000/privacy-policy.html
   ```

   **Application terms of service link:**
   ```
   https://your-domain.com/terms-of-service
   ```
   OR for local testing:
   ```
   http://localhost:3000/terms-of-service.html
   ```

   **Authorized domains:**
   ```
   your-domain.com
   ```
   (Or leave blank for localhost testing)

   **Developer contact information:**
   ```
   [Your email address]
   ```

4. **Scopes Configuration**
   - Click **Add or Remove Scopes**
   - Select the following scopes:
     - ✅ `.../auth/userinfo.email` (See your email address)
     - ✅ `.../auth/userinfo.profile` (See your personal info)
     - ✅ `openid` (Authenticate using OpenID Connect)
   - Click **Update**
   - Click **Save and Continue**

5. **Test Users** (Only needed if app is in Testing mode)
   - Click **Add Users**
   - Add your email address
   - Add any other test users
   - Click **Save and Continue**

6. **Summary**
   - Review your settings
   - Click **Back to Dashboard**

---

### Part 3: Important Consent Screen Language

For the **App Description** field, use this text that includes data usage consent:

```
NoMoreFOMO is an AI-powered chat platform that intelligently routes your queries to the best AI models.

By signing in, you consent to:
• Our collection and use of your chat data to provide AI services
• Creation of anonymized, aggregated analytics from your usage
• Commercial use of anonymized data for research and analytics products

Your personal information and individual messages are NEVER sold or shared identifiably. Only statistical, aggregated insights (e.g., "60% of users prefer Model X for coding") are used commercially.

Read our full Privacy Policy and Terms of Service for details.
```

---

### Part 4: Create OAuth Credentials

1. **Navigate to Credentials**
   - In the left sidebar, go to **APIs & Services** → **Credentials**

2. **Create OAuth Client ID**
   - Click **+ Create Credentials**
   - Select **OAuth client ID**

3. **Application Type**
   - Choose **Web application**

4. **Configure OAuth Client**

   **Name:**
   ```
   NoMoreFOMO Web Client
   ```

   **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://your-domain.com
   ```

   **Authorized redirect URIs:**
   ```
   http://localhost:3000/auth/callback
   https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback
   ```

   **How to find your Supabase redirect URI:**
   - Go to your Supabase dashboard
   - Click on Authentication → Providers → Google
   - Copy the "Callback URL (for OAuth)" shown there

5. **Create**
   - Click **Create**
   - You'll see your **Client ID** and **Client Secret**
   - **IMPORTANT**: Copy these and keep them safe!

---

### Part 5: Add Credentials to Supabase

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Configure Google Provider**
   - Go to **Authentication** → **Providers**
   - Find **Google** in the list
   - Toggle it **ON**

3. **Add Credentials**
   - Paste your **Client ID** from Google
   - Paste your **Client Secret** from Google
   - Click **Save**

---

### Part 6: Deploy Privacy Policy & Terms

You need to make your privacy policy and terms accessible:

**Option A: For Production (Recommended)**
1. Convert the MD files to HTML
2. Host them on your domain at:
   - `https://your-domain.com/privacy-policy`
   - `https://your-domain.com/terms-of-service`

**Option B: For Testing (Temporary)**
1. Convert MD to HTML and place in `/public` folder
2. Access at `http://localhost:3000/privacy-policy.html`

---

### Part 7: Publishing Your App

**Testing Mode vs Production:**

**Testing Mode** (Default):
- Limited to test users you specify
- No Google verification needed
- Good for development

**Production Mode:**
- Available to all Google users
- Requires Google verification (review process)
- Takes 1-4 weeks for approval

**To Publish:**
1. In OAuth consent screen, click **Publish App**
2. Submit for verification if needed
3. Google will review your:
   - Privacy policy
   - Terms of service
   - Data usage disclosure
   - OAuth scopes

---

## Data Usage Disclosure Requirements

**IMPORTANT**: When submitting for verification, Google requires clear disclosure about:

1. **What data you collect**: User email, profile, usage data
2. **How you use it**: Service provision, analytics, aggregated insights
3. **Who you share with**: AI providers (OpenAI, Anthropic, Google), analytics partners
4. **Commercial use**: Clearly state that anonymized data may be sold

**In your verification submission, include:**
- Link to privacy policy
- Link to terms of service
- Video demo of OAuth flow
- Explanation of why you need each scope

---

## Testing Your Setup

1. **Go to your login page**
   ```
   http://localhost:3000/auth/login
   ```

2. **Click "Continue with Google"**

3. **You should see:**
   - Google sign-in page
   - Your app name "NoMoreFOMO"
   - Consent screen showing scopes
   - Your privacy policy link

4. **After signing in:**
   - You'll be redirected to `/auth/callback`
   - Then automatically to `/chat`
   - A user profile will be created automatically

---

## Troubleshooting

**Error: "redirect_uri_mismatch"**
- Check that your redirect URI in Google Console exactly matches Supabase's callback URL

**Error: "invalid_client"**
- Double-check Client ID and Secret in Supabase
- Ensure they match what's in Google Console

**Users can't sign in (not in test users list)**
- Either add them as test users
- Or publish your app (submit for verification)

**Privacy policy not accessible**
- Make sure the URL is publicly accessible
- Use absolute URLs, not relative paths

---

## Legal Compliance Checklist

Before launching:
- ✅ Privacy Policy clearly describes data collection and usage
- ✅ Terms of Service includes consent for data monetization
- ✅ Cookie/consent banner if operating in EU (GDPR)
- ✅ "Do Not Sell My Info" link if California users (CCPA)
- ✅ Data retention and deletion policies documented
- ✅ User rights (access, deletion, opt-out) clearly explained
- ✅ Contact information for privacy inquiries
- ✅ Regular privacy policy reviews and updates

---

## Next Steps

After OAuth is working:
1. Add consent checkbox during first login
2. Implement user settings page with privacy controls
3. Add "opt-out of analytics" feature
4. Set up data export functionality
5. Implement account deletion flow
6. Regular privacy policy updates

---

Need help? Contact: support@nomorefomo.ai
