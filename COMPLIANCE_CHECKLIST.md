# NoMoreFOMO - Legal & Compliance Checklist

## ❌ CRITICAL MISSING REQUIREMENTS

### 🍪 Cookie Consent (GDPR/CCPA Required)
**Status:** ❌ **MISSING - HIGH PRIORITY**

**What we need:**
- [ ] Cookie consent banner on first visit
- [ ] "Accept All" / "Reject All" / "Customize" buttons
- [ ] Remember user's choice (localStorage)
- [ ] Block non-essential cookies until consent given
- [ ] Link to Cookie Policy

**Our current cookies:**
- `nomorefomo_trial_count` (HttpOnly) - Trial message tracking
- `nomorefomo_session_id` - Anonymous session tracking
- Supabase auth cookies (authentication)

**Legal requirement:** GDPR Article 7, ePrivacy Directive, CCPA Section 1798.140

**Implementation priority:** 🔥 **CRITICAL** (Before EU/CA launch)

**Effort:** Medium (1-2 days)

**Recommended library:** `react-cookie-consent` or `cookie-consent-js`

---

### 📄 Privacy Policy
**Status:** ❌ **MISSING - HIGH PRIORITY**

**Must include:**
- [ ] What data we collect (email, messages, IP, cookies)
- [ ] How we use data (service delivery, analytics, billing)
- [ ] Third-party services (Supabase, Stripe, OpenAI, Anthropic, Google)
- [ ] Data retention policy (how long we keep data)
- [ ] User rights (access, deletion, portability)
- [ ] Contact information for privacy inquiries
- [ ] Data transfer (US-EU data flows)
- [ ] Children's privacy (COPPA - under 13 not allowed)
- [ ] Changes to policy notification process

**GDPR-specific requirements:**
- [ ] Legal basis for processing (consent, contract, legitimate interest)
- [ ] Data controller information (your company details)
- [ ] DPO contact (if applicable)
- [ ] Right to lodge complaint with supervisory authority

**CCPA-specific requirements:**
- [ ] Categories of personal information collected
- [ ] Sale of personal information (we don't sell, must state this)
- [ ] "Do Not Sell My Personal Information" link

**Where to add:** `/privacy-policy` page

**Effort:** High (3-5 days if writing from scratch, 1 day using template)

**Recommended:** Use privacy policy generator + lawyer review

---

### 📋 Terms of Service
**Status:** ⚠️ **PARTIAL** (exists but incomplete)

**Current file:** `/app/(auth)/terms/page.tsx`

**Must add:**
- [ ] Acceptable use policy (no abuse, no illegal content)
- [ ] Prohibited uses (scraping, reverse engineering)
- [ ] Intellectual property rights (our content, user content)
- [ ] Limitation of liability
- [ ] Warranty disclaimers
- [ ] Indemnification clause
- [ ] Termination rights (we can suspend accounts)
- [ ] Dispute resolution (arbitration clause)
- [ ] Governing law (which state/country)
- [ ] Contact information

**Current issues:**
- Too basic, not legally comprehensive
- Missing standard boilerplate clauses
- No mention of refund policy

**Effort:** Medium (2-3 days with lawyer review)

---

### 🔐 Data Protection & Rights

#### GDPR Rights (EU users)
**Status:** ❌ **MISSING**

**Must implement:**
- [ ] **Right to Access** - Users can download their data
- [ ] **Right to Rectification** - Users can correct their data
- [ ] **Right to Erasure** ("Right to be forgotten") - Delete account + all data
- [ ] **Right to Portability** - Export data in machine-readable format (JSON)
- [ ] **Right to Object** - Opt-out of marketing/analytics
- [ ] **Right to Restrict Processing** - Pause account without deletion

**Where to add:**
- Settings page with "Download My Data" button
- Settings page with "Delete My Account" button
- Export endpoint: `/api/user/export-data`
- Delete endpoint: `/api/user/delete-account`

**Effort:** Medium (3-4 days)

---

#### CCPA Rights (California users)
**Status:** ❌ **MISSING**

**Must implement:**
- [ ] "Do Not Sell My Personal Information" link in footer
- [ ] Disclosure of data categories collected
- [ ] Right to know what data is collected
- [ ] Right to delete personal information
- [ ] Right to opt-out of sale (we don't sell, but must state this)
- [ ] Non-discrimination for exercising rights

**Implementation:** Similar to GDPR but with CA-specific language

**Effort:** Medium (can reuse GDPR implementation)

---

### 🔞 Age Restrictions (COPPA Compliance)
**Status:** ❌ **MISSING**

**Legal requirement:** Cannot collect data from children under 13 (US law)

**Must add:**
- [ ] Age gate on signup ("Are you 13 or older?")
- [ ] Terms of Service: "Must be 13+ to use"
- [ ] Privacy Policy: "We do not knowingly collect data from children under 13"
- [ ] Parental consent mechanism (if allowing 13-16 year olds)

**Recommended:** Set minimum age to 16 (easier compliance)

**Effort:** Low (1 day)

---

## ⚠️ COMPLIANCE GAPS TO FIX

### 🔒 Data Security

**Current status:** ⚠️ **PARTIAL**

**What we have:**
- ✅ HTTPS enabled
- ✅ Supabase RLS (Row Level Security)
- ✅ Password hashing (handled by Supabase)
- ✅ HttpOnly cookies
- ✅ CSRF protection (Next.js built-in)

**What's missing:**
- [ ] Data encryption at rest (check Supabase settings)
- [ ] Regular security audits
- [ ] Incident response plan (data breach notification)
- [ ] Security documentation for users
- [ ] Bug bounty program

**GDPR requirement:** Article 32 - Security of processing

---

### 📧 Email Notifications & Opt-out

**Status:** ⚠️ **PARTIAL**

**What's missing:**
- [ ] Unsubscribe link in all marketing emails
- [ ] Email preferences page (what emails to receive)
- [ ] Double opt-in for marketing emails (GDPR best practice)
- [ ] Separate consent for transactional vs marketing emails

**CAN-SPAM Act requirement:** Must allow opt-out within 10 business days

**Effort:** Medium (2-3 days)

---

### 🌍 International Data Transfers

**Status:** ❌ **MISSING**

**Issue:** We use US-based services (Supabase, Stripe, OpenAI)
**GDPR requirement:** Must inform EU users about data transfer outside EU

**Must add to Privacy Policy:**
- [ ] Notice that data is transferred to US
- [ ] Explain safeguards (Standard Contractual Clauses, Privacy Shield successor)
- [ ] List all third-party processors and their locations

**Effort:** Low (documentation only)

---

### 💳 Stripe/Payment Compliance

**Status:** ✅ **MOSTLY COMPLIANT**

**What we have:**
- ✅ Stripe handles PCI compliance (we don't store card data)
- ✅ Secure checkout flow
- ✅ Webhook verification

**What's missing:**
- [ ] Clear refund policy (must state if no refunds)
- [ ] Cancellation process (how to cancel subscription)
- [ ] Invoice generation (Stripe Invoicing)
- [ ] Tax collection (Stripe Tax for EU VAT)

**Effort:** Low-Medium (1-2 days)

---

## 📊 IMPLEMENTATION PRIORITY

### 🔥 **PHASE 1: CRITICAL (Before Public Launch)**
**Timeline:** 3-5 days
**Legal Risk:** HIGH

1. **Cookie Consent Banner** (Day 1)
   - Install library, add banner, connect to cookie management

2. **Privacy Policy** (Day 2-3)
   - Use template, customize for our services
   - Lawyer review (recommended)

3. **Age Gate** (Day 3)
   - Add "13+" checkbox to signup
   - Update Terms to state age requirement

4. **Data Deletion Endpoint** (Day 4-5)
   - API endpoint to delete user + all messages
   - Add "Delete Account" button to settings

### ⚠️ **PHASE 2: IMPORTANT (Within 30 Days)**
**Timeline:** 5-7 days
**Legal Risk:** MEDIUM

5. **Data Export** (Day 1-2)
   - Download conversations as JSON
   - "Download My Data" button

6. **Terms of Service Update** (Day 2-3)
   - Comprehensive ToS with all legal clauses
   - Lawyer review (recommended)

7. **Email Opt-out** (Day 3-4)
   - Unsubscribe links
   - Email preferences page

8. **Refund Policy** (Day 4)
   - Document and add to pricing page

### 📝 **PHASE 3: NICE TO HAVE (Within 90 Days)**
**Timeline:** Ongoing
**Legal Risk:** LOW

9. **Security Audits**
10. **Data Breach Response Plan**
11. **Bug Bounty Program**
12. **Cookie Policy Page** (separate from Privacy Policy)

---

## 🛠️ TECHNICAL IMPLEMENTATION GUIDE

### Cookie Consent Banner

**Install library:**
```bash
npm install react-cookie-consent
```

**Add to layout.tsx:**
```tsx
import CookieConsent from "react-cookie-consent";

<CookieConsent
  location="bottom"
  buttonText="Accept All"
  declineButtonText="Reject All"
  enableDeclineButton
  cookieName="nomorefomo_cookie_consent"
  style={{ background: "#1e293b" }}
  buttonStyle={{ background: "#3b82f6", color: "#ffffff" }}
  expires={365}
>
  We use cookies to improve your experience. By using our site, you agree to our{" "}
  <a href="/privacy-policy" className="underline">Privacy Policy</a> and{" "}
  <a href="/cookie-policy" className="underline">Cookie Policy</a>.
</CookieConsent>
```

**Block analytics until consent:**
```tsx
const handleAccept = () => {
  // Enable Google Analytics, Microsoft Clarity, etc.
  if (typeof window !== 'undefined') {
    window.gtag('consent', 'update', {
      'analytics_storage': 'granted'
    });
  }
};
```

---

### Data Export Endpoint

**Create `/api/user/export-data/route.ts`:**
```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch all user data
  const [profile, conversations, messages] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('id', user.id).single(),
    supabase.from('conversations').select('*').eq('user_id', user.id),
    supabase.from('messages').select('*').eq('user_id', user.id),
  ]);

  const exportData = {
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    },
    profile: profile.data,
    conversations: conversations.data,
    messages: messages.data,
    exported_at: new Date().toISOString(),
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="nomorefomo-data-${user.id}.json"`,
    },
  });
}
```

---

### Account Deletion Endpoint

**Create `/api/user/delete-account/route.ts`:**
```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Delete all user data (cascading deletes via foreign keys)
  await supabase.from('user_profiles').delete().eq('id', user.id);

  // Delete auth account
  await supabase.auth.admin.deleteUser(user.id);

  return NextResponse.json({ success: true });
}
```

---

## 📋 COMPLIANCE CHECKLIST SUMMARY

| Requirement | Status | Priority | Effort | Legal Risk |
|-------------|--------|----------|--------|------------|
| Cookie Consent Banner | ❌ Missing | 🔥 Critical | Medium | High |
| Privacy Policy | ❌ Missing | 🔥 Critical | High | High |
| Age Gate (13+) | ❌ Missing | 🔥 Critical | Low | High |
| Data Deletion (GDPR) | ❌ Missing | 🔥 Critical | Medium | High |
| Data Export (GDPR) | ❌ Missing | ⚠️ Important | Medium | Medium |
| Updated Terms of Service | ⚠️ Partial | ⚠️ Important | Medium | Medium |
| Email Opt-out | ❌ Missing | ⚠️ Important | Medium | Medium |
| Refund Policy | ❌ Missing | ⚠️ Important | Low | Medium |
| "Do Not Sell" Link (CCPA) | ❌ Missing | ⚠️ Important | Low | Medium |
| Data Transfer Notice | ❌ Missing | 📝 Nice-to-have | Low | Low |
| Security Audit | ❌ Missing | 📝 Nice-to-have | High | Low |

---

## 🎯 RECOMMENDED NEXT STEPS

1. **NOW (Option C ongoing):**
   - ✅ Loading indicators (DONE)
   - You: Set up Google Search Console
   - Me: Add Google verification meta tag

2. **THIS WEEK (After Google setup):**
   - Cookie consent banner (1 day)
   - Privacy policy draft (2 days - use template)
   - Age gate on signup (1 day)

3. **NEXT WEEK:**
   - Data deletion endpoint (1-2 days)
   - Data export endpoint (1 day)
   - Updated Terms of Service (2 days)

4. **OPTIONAL (Lawyer):**
   - Get Privacy Policy + Terms reviewed ($500-2,000)
   - Highly recommended before scaling

---

**Legal Disclaimer:** I'm not a lawyer. This checklist is for informational purposes only. Consult with a lawyer specializing in privacy law before launch.

**Last Updated:** November 2025
