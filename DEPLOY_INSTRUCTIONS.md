# Quick Deployment & OAuth Setup Instructions

## Step 1: Deploy to Vercel (5 minutes)

### Option A: Using Vercel Dashboard (Easiest)
1. Go to https://vercel.com/
2. Sign in with GitHub/Google
3. Click "Add New" → "Project"
4. Import your GitHub repo (or drag & drop your project folder)
5. Click "Deploy"
6. Wait 2-3 minutes
7. Copy your production URL (e.g., `https://nomorefomo.vercel.app`)

### Option B: Using CLI (Faster if you have Vercel installed)
```bash
# In your project directory
npx vercel login
npx vercel

# Follow prompts, then get your URL
```

---

## Step 2: Set Environment Variables in Vercel

After deployment, add your environment variables:

1. Go to your project in Vercel Dashboard
2. Settings → Environment Variables
3. Add these variables (copy from your `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=[your value]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your value]
GOOGLE_API_KEY=[your value]
OPENAI_API_KEY=[your value]
ANTHROPIC_API_KEY=[your value]
```

4. Click "Save"
5. Redeploy (Deployments → Latest → ... → Redeploy)

---

## Step 3: Update Google OAuth Consent Screen

**YOUR VERCEL URL:** `https://[your-project].vercel.app`

Go back to Google Cloud Console → OAuth consent screen:

**Update these fields:**
```
Application home page: https://[your-project].vercel.app

Privacy Policy link: https://[your-project].vercel.app/privacy-policy

Terms of Service link: https://[your-project].vercel.app/terms-of-service

Authorized domains: [your-project].vercel.app
```

Click "Save and Continue"

---

## Step 4: Create OAuth Credentials

1. Go to **Credentials** in left sidebar
2. Click "+ Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Fill in:

```
Name: NoMoreFOMO Web Client

Authorized JavaScript origins:
  https://[your-project].vercel.app

Authorized redirect URIs:
  https://[your-project].vercel.app/auth/callback
  https://[your-supabase-project].supabase.co/auth/v1/callback
```

5. Click "Create"
6. **COPY the Client ID and Client Secret** (you'll need these next!)

---

## Step 5: Add Credentials to Supabase

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find "Google" and toggle it ON
5. Paste:
   - Client ID (from Google)
   - Client Secret (from Google)
6. Copy the "Callback URL" shown (you may need to add this to Google if not done)
7. Click "Save"

---

## Step 6: Test It! 🎉

1. Go to your deployed app: `https://[your-project].vercel.app/auth/login`
2. Click "Continue with Google"
3. Sign in with your Google account
4. You should see the OAuth consent screen
5. Accept and get redirected to chat!

---

## Troubleshooting

**Error: redirect_uri_mismatch**
- Make sure the redirect URI in Google Console exactly matches:
  - `https://[your-project].vercel.app/auth/callback`
  - `https://[your-supabase].supabase.co/auth/v1/callback`

**Error: 404 on privacy policy**
- Make sure you redeployed after adding environment variables
- Check that the pages are accessible at `/privacy-policy` and `/terms-of-service`

**Users see "App not verified"**
- This is normal for testing mode
- Click "Advanced" → "Go to NoMoreFOMO (unsafe)" to proceed
- To remove this, submit your app for verification (takes 1-4 weeks)

---

## Quick Checklist

- [ ] Deploy to Vercel
- [ ] Add environment variables in Vercel
- [ ] Redeploy
- [ ] Update Google OAuth consent screen with Vercel URLs
- [ ] Create OAuth credentials in Google
- [ ] Add credentials to Supabase
- [ ] Test login!

---

**Need help?** Just ask! I'm here to assist. 🚀
