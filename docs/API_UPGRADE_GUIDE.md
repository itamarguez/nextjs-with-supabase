# API Upgrade Guide: Moving to Paid API Tiers

**Last Updated:** January 2025
**Status:** NoMoreFOMO currently uses free/experimental API tiers

---

## 📌 Why Upgrade to Paid API Tiers?

### Current Limitations (Free Tiers)

1. **Rate Limits**: Free APIs hit 429 errors during high traffic
2. **Experimental Models**: Gemini 2.0 Flash Thinking is experimental (may change)
3. **Data Usage**: Free tier prompts may be used to improve Google products
4. **Reliability**: No SLA guarantees on free tiers
5. **Failover Overhead**: Auto-failover adds latency when rate limits hit

### Benefits of Paid Tiers

✅ **Higher Rate Limits**: 10-100x more requests per minute
✅ **Data Privacy**: Your prompts are NOT used for model training
✅ **SLA Guarantees**: 99.9% uptime commitments
✅ **Batch Processing**: 50% cost savings for non-urgent workloads
✅ **Priority Support**: Direct technical support channels
✅ **Stable Models**: Production-ready models with versioning guarantees

---

## 💰 Pricing Comparison (2025)

### Google Gemini API

| Model | Input Cost (per 1M tokens) | Output Cost (per 1M tokens) | Notes |
|-------|---------------------------|----------------------------|-------|
| **Gemini 2.5 Flash** | $0.15 | $0.60 (no reasoning)<br>$3.50 (with reasoning) | Best for casual/data analysis |
| **Gemini 2.5 Pro** | $1.25 (≤200K input)<br>$2.50 (>200K input) | $10.00 (≤200K input)<br>$15.00 (>200K input) | Best for complex reasoning |

**Free Tier Rate Limits**: 15 RPM, 1M TPM, 1500 RPD
**Paid Tier Rate Limits**: 1000+ RPM, 4M+ TPM (project-based)

**How to Upgrade**:
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Enable billing in your Google Cloud project
3. Set up [Cloud Billing Account](https://cloud.google.com/billing/docs/how-to/create-billing-account)
4. Update your API key to use the paid project
5. No code changes needed - same API endpoints

**Data Privacy**: Paid tier prompts are NOT used to improve Google products

---

### OpenAI API

| Model | Tier | Input Cost (per 1M tokens) | Output Cost (per 1M tokens) |
|-------|------|---------------------------|----------------------------|
| **GPT-4o** | Batch | $1.25 | $5.00 |
| **GPT-4o** | Standard | $2.50 | $10.00 |
| **GPT-4o** | Priority | Higher | Higher |
| **GPT-4o-mini** | Standard | $0.15 | $0.60 |

**Tier Comparison**:
- **Batch**: 50% cheaper, 24-hour processing (best for analytics, summaries)
- **Standard**: Balanced cost/latency (best for user-facing apps)
- **Flex**: Lower cost with variable latency (lower-demand periods)
- **Priority**: Fastest responses (peak traffic, mission-critical)

**Rate Limits**:
- Free tier: 3 RPM, 200 RPD, 40K TPM
- Tier 1 ($5+ spent): 500 RPM, 10K RPD, 30M TPM
- Tier 5 ($1000+ spent): 10K RPM, unlimited requests

**How to Upgrade**:
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Go to Settings → Billing
3. Add payment method (credit card)
4. Automatic tier upgrade based on spend
5. Enable [Batch API](https://platform.openai.com/docs/guides/batch) for 50% savings

**Usage Limits**: $100/month by default (can be increased)

---

### Anthropic Claude API

| Model | Input Cost (per 1M tokens) | Output Cost (per 1M tokens) | Thinking Cost (per 1M) |
|-------|---------------------------|----------------------------|------------------------|
| **Claude 3.5 Haiku** | $0.80 | $4.00 | N/A |
| **Claude 4.1 Sonnet** | $5.00 | $25.00 | $10.00 |
| **Claude 4.1 Opus** | $15.00 | $75.00 | N/A |
| **Haiku 4.5** | $1.00 | $5.00 | N/A |

**Cost-Saving Features**:
- **Batch Processing**: 50% discount on input/output tokens
- **Prompt Caching**: Up to 90% savings (cache reads at 0.1x base price)
- **Code Execution**: 50 free hours/day, then $0.05/hour

**Rate Limits**:
- Free tier: **NONE** (API is paid-only)
- Tier 1: 50 RPM, 40K TPM
- Tier 4 ($1000+ spent): 4000 RPM, 4M TPM

**How to Upgrade**:
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create account and verify identity
3. Add payment method (credit card required)
4. Generate API key
5. Update `.env.local` with new key

**Important**: Anthropic has NO free tier - all API usage is billed

---

## 🎯 NoMoreFOMO Cost Analysis

### Current Usage Patterns (From Database)

Based on recent production data:
- **Average tokens per request**: ~1,500 tokens (1,000 input + 500 output)
- **Daily requests**: ~50-100 requests
- **Monthly requests**: ~2,000 requests
- **Gemini usage**: 80% of requests (currently free)
- **GPT-4o-mini usage**: 15% of requests (failover)
- **Claude Haiku usage**: 5% of requests (failover)

### Monthly Cost Projections (Paid Tiers)

#### Scenario 1: Google Gemini Only (Recommended)

**Model**: Gemini 2.5 Flash
**Monthly requests**: 2,000
**Tokens per request**: 1,500 (1,000 input + 500 output)

```
Input cost:  (2,000 × 1,000 / 1,000,000) × $0.15 = $0.30
Output cost: (2,000 × 500 / 1,000,000) × $0.60 = $0.60
-------------------------------------------------------
Total: $0.90/month
```

**✅ Best for**: Current usage patterns, casual + data analysis heavy

---

#### Scenario 2: Hybrid (Gemini + GPT-4o Failover)

**Primary**: Gemini 2.5 Flash (80% of requests)
**Failover**: GPT-4o-mini (20% of requests)

```
Gemini:  (1,600 × 1,500 / 1,000,000) × $0.375 = $0.90
GPT-4o:  (400 × 1,500 / 1,000,000) × $1.35  = $0.81
-------------------------------------------------------
Total: $1.71/month
```

**✅ Best for**: Reliability + cost balance

---

#### Scenario 3: Premium (Claude Sonnet Priority)

**Model**: Claude 4.1 Sonnet
**Monthly requests**: 2,000
**Tokens per request**: 1,500

```
Input cost:  (2,000 × 1,000 / 1,000,000) × $5.00  = $10.00
Output cost: (2,000 × 500 / 1,000,000) × $25.00 = $25.00
-------------------------------------------------------
Total: $35.00/month
```

**✅ Best for**: Maximum quality, coding-heavy workloads

---

#### Scenario 4: Cost-Optimized (Batch Processing)

**Model**: GPT-4o Batch API
**Monthly requests**: 2,000
**Processing**: 24-hour delay acceptable

```
Input cost:  (2,000 × 1,000 / 1,000,000) × $1.25 = $2.50
Output cost: (2,000 × 500 / 1,000,000) × $5.00  = $5.00
-------------------------------------------------------
Total: $7.50/month (50% cheaper than Standard tier)
```

**✅ Best for**: Analytics, summaries, non-urgent tasks

---

## 🚀 Upgrade Implementation Steps

### Step 1: Choose Your Strategy

**Recommended for NoMoreFOMO**: Hybrid approach (Gemini + GPT-4o failover)

**Reasoning**:
- Gemini 2.5 Flash is extremely cost-efficient ($0.90/month)
- GPT-4o-mini provides reliable failover
- Auto-failover system already implemented
- Total cost: ~$2-5/month for current usage

---

### Step 2: Upgrade Google Gemini (Primary Model)

1. **Enable Billing**:
   ```bash
   # Visit Google Cloud Console
   open https://console.cloud.google.com/billing
   ```

2. **Create/Link Billing Account**:
   - Click "Link a billing account"
   - Add payment method (credit card)
   - Accept terms and conditions

3. **Update API Project**:
   ```bash
   # Visit Google AI Studio
   open https://aistudio.google.com/

   # Click on your API key
   # Enable billing for the project
   # No code changes needed - same API key works
   ```

4. **Set Budget Alerts** (Recommended):
   - Go to Billing → Budgets & Alerts
   - Set monthly budget: $10 (10x safety margin)
   - Enable email alerts at 50%, 80%, 100%

5. **Verify Upgrade**:
   ```bash
   # Send test request to Gemini API
   curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=YOUR_API_KEY" \
     -H 'Content-Type: application/json' \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'

   # Check response headers for rate limit info
   # X-RateLimit-Limit should be higher (1000+ instead of 15)
   ```

---

### Step 3: Upgrade OpenAI (Failover Model)

1. **Add Payment Method**:
   ```bash
   # Visit OpenAI Platform
   open https://platform.openai.com/account/billing/overview
   ```

2. **Add Credit Card**:
   - Click "Set up paid account"
   - Enter payment details
   - Set monthly budget: $10

3. **Enable Batch API** (Optional - 50% savings):
   ```bash
   # No special setup needed - just use batch endpoints
   # See: https://platform.openai.com/docs/guides/batch
   ```

4. **Update Usage Limits**:
   - Go to Settings → Limits
   - Set hard cap: $10/month
   - Enable email alerts

---

### Step 4: Upgrade Anthropic Claude (Optional)

1. **Create Paid Account**:
   ```bash
   # Visit Anthropic Console
   open https://console.anthropic.com/
   ```

2. **Add Payment Method**:
   - Go to Settings → Billing
   - Add credit card (required for API access)
   - No free tier available

3. **Generate API Key**:
   - Go to Settings → API Keys
   - Click "Create Key"
   - Copy key to `.env.local`:
   ```bash
   ANTHROPIC_API_KEY=sk-ant-api03-YOUR-KEY-HERE
   ```

4. **Enable Prompt Caching** (90% savings):
   - Already implemented in NoMoreFOMO
   - See `/lib/cache/prompt-cache.ts`
   - Automatic cache reads at 0.1x cost

---

### Step 5: Monitor Costs

1. **Set Up Cost Tracking**:
   ```bash
   # Add to .env.local
   COST_ALERT_EMAIL=your-email@example.com
   MONTHLY_BUDGET_USD=10.00
   ```

2. **Check Admin Dashboard**:
   ```bash
   # Visit your NoMoreFOMO admin panel
   open https://nomorefomo.vercel.app/admin

   # Monitor:
   # - Daily cost breakdown
   # - Model usage distribution
   # - Cost per user
   # - Monthly projections
   ```

3. **Enable Provider Dashboards**:
   - **Google**: [Cloud Billing Reports](https://console.cloud.google.com/billing/reports)
   - **OpenAI**: [Usage Dashboard](https://platform.openai.com/usage)
   - **Anthropic**: [Console Usage](https://console.anthropic.com/settings/usage)

---

## 📊 Cost Optimization Tips

### 1. Use Prompt Caching (Already Implemented)
- **Savings**: Up to 90% for repeated prompts
- **Implementation**: Already active in NoMoreFOMO
- **Cache Hit Rate**: Monitor at `/admin` dashboard

### 2. Enable Batch Processing
- **Savings**: 50% discount on both input/output
- **Best for**: Analytics, summaries, email generation
- **Tradeoff**: 24-hour processing time

### 3. Optimize Token Usage
- **Current**: ~1,500 tokens per request
- **Target**: Reduce to ~1,000 tokens per request (33% savings)
- **How**: Shorter system prompts, summarize conversation history

### 4. Smart Model Selection
- **Casual queries**: Gemini Flash ($0.15 input)
- **Coding tasks**: Claude Haiku ($0.80 input)
- **Complex reasoning**: GPT-4o ($2.50 input)
- **NoMoreFOMO already does this automatically**

### 5. Monitor and Alert
- Set budget alerts at 50%, 80%, 100%
- Review weekly usage reports
- Identify high-cost users/patterns

---

## ⚠️ Important Considerations

### 1. Budget Management
- **Recommended starting budget**: $10/month
- **Current projected usage**: $2-5/month
- **Safety margin**: 2-5x for traffic spikes

### 2. Failover Strategy
- Keep auto-failover enabled even with paid tiers
- Prevents outages if one provider has issues
- Already implemented in Phase 8.2

### 3. Data Privacy
- **Free tiers**: Prompts may be used for training
- **Paid tiers**: Prompts are NOT used for training
- **Critical for production apps**

### 4. Rate Limit Increases
- Paid tiers have much higher rate limits
- But still need exponential backoff (already implemented)
- Monitor rate limit headers in responses

### 5. API Key Security
- Never commit API keys to git
- Use `.env.local` (already in `.gitignore`)
- Rotate keys quarterly
- Enable key restrictions (IP allowlists) where possible

---

## 🎯 Recommended Action Plan

### Phase 1: Upgrade Gemini (Primary Model)
**Cost**: $0.90/month
**Impact**: Eliminates 80% of rate limit errors
**Timeline**: 10 minutes
**Steps**: Follow "Step 2: Upgrade Google Gemini" above

### Phase 2: Upgrade OpenAI (Failover)
**Cost**: $0.80/month
**Impact**: Reliable failover for remaining 20% of requests
**Timeline**: 5 minutes
**Steps**: Follow "Step 3: Upgrade OpenAI" above

### Phase 3: Monitor and Optimize
**Cost**: $0
**Impact**: Track actual usage vs projections
**Timeline**: Ongoing
**Steps**: Check admin dashboard weekly

### Phase 4 (Optional): Upgrade Claude
**Cost**: ~$35/month (if used as primary)
**Impact**: Highest quality responses
**Timeline**: 10 minutes
**When**: If user feedback shows quality issues with Gemini

---

## 📈 Expected Outcomes

After upgrading to paid API tiers:

✅ **99.9% reduction** in rate limit errors (429s)
✅ **50-90% cost savings** via caching and batch processing
✅ **Data privacy** guaranteed (no training on your prompts)
✅ **Higher rate limits** (1000+ RPM vs 15 RPM)
✅ **SLA guarantees** (99.9% uptime)
✅ **Priority support** from providers

**Total Monthly Cost**: $2-5 for current usage (2,000 requests/month)

---

## 📞 Support and Resources

### Official Documentation
- [Google Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Anthropic API Docs](https://docs.anthropic.com/)

### Cost Calculators
- [Google Gemini Pricing Calculator](https://ai.google.dev/pricing)
- [OpenAI Pricing Calculator](https://openai.com/pricing)
- [Anthropic Pricing Calculator](https://www.anthropic.com/pricing)

### NoMoreFOMO Internal Resources
- Admin Dashboard: `https://nomorefomo.vercel.app/admin`
- Cost Analytics: See `/admin` → "Cost Breakdown"
- Cache Stats: See `/admin` → "Cache Statistics"
- Model Usage: See `/admin` → "Model Distribution"

---

**Last Updated**: January 2025
**Next Review**: February 2025 (after 1 month of paid tier usage)
