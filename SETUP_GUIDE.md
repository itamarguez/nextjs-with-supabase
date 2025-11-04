# NoMoreFOMO Setup Guide

Welcome to **NoMoreFOMO** - the intelligent LLM router that picks the best AI model for every prompt!

## 🚀 Quick Start

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in your API keys:

```bash
cp .env.example .env.local
```

You'll need:
- **Supabase** (required for auth & database)
- **OpenAI API Key** (required for GPT-4o Mini)
- **Anthropic API Key** (optional - for Claude models)
- **Google API Key** (optional - for Gemini Flash)

### 2. Supabase Setup

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key to `.env.local`

#### Run Database Migrations
Execute the SQL schema in your Supabase SQL editor:

1. Open Supabase Dashboard → SQL Editor
2. Copy the contents of `lib/db-schema.sql`
3. Run the script

This will create:
- User profiles with tier management
- Conversations & messages tables
- Rate limiting tables
- Abuse detection logs
- Admin analytics tables

### 3. Get API Keys

#### OpenAI (Required)
1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add credits to your account
4. Add key to `.env.local`

#### Anthropic (Optional but Recommended)
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Generate an API key
3. Add key to `.env.local`

#### Google AI (Optional)
1. Go to [makersuite.google.com](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add key to `.env.local`

### 4. Install & Run

```bash
# Install dependencies (already done)
npm install

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📊 How It Works

### Intelligent Model Selection

NoMoreFOMO analyzes each prompt and automatically selects the best model based on:

1. **Task Category Detection**
   - 💻 Coding (debug, implement, refactor)
   - ✍️ Creative (writing, content, brainstorming)
   - 🧮 Math (calculations, reasoning, proofs)
   - 📊 Data Analysis (summarization, extraction)
   - 💬 Casual (general questions, chat)

2. **LMArena Rankings**
   - Uses real performance data
   - Picks top-ranked model for each category
   - Based on user's tier access

3. **Cost Efficiency**
   - Optimizes for budget models on free tier
   - Unlocks premium models on paid tiers

### Freemium Tiers

#### Free Tier
- 100,000 tokens/month
- 200 requests/day
- GPT-4o Mini & Gemini Flash
- Perfect for testing and light usage

#### Pro Tier ($20/month)
- 1,000,000 tokens/month
- 2,000 requests/day
- All Free models + Claude 3.5 Haiku
- Larger context windows (32K)
- Priority support

#### Unlimited Tier ($100/month)
- Unlimited tokens
- 10,000 requests/day
- GPT-4o & Claude 3.5 Sonnet
- Maximum context (200K)
- Priority queue
- Dedicated support

## 🛡️ Abuse Prevention

Built-in protection against abuse:

- **Rate Limiting**: Per minute, hour, and day limits
- **Token Tracking**: Monthly usage monitoring
- **Suspicious Activity Detection**:
  - Repeated identical prompts
  - Too-fast request patterns
  - Malformed/spam content
- **Automatic Suspension**: After 10 violations

All tracked in database for admin review.

## 🔐 Admin Dashboard

Access the admin dashboard at `/admin` to monitor:

- Total platform costs (hidden from users)
- Token usage by model
- Top users by cost
- Abuse incidents
- User tier distribution

**Important**: Cost data is NEVER shown to users - only to you as the admin.

## 📱 Key Features

### For Users
- ✅ Chat interface like ChatGPT/Claude
- ✅ Model badge showing which AI answered
- ✅ Explanation of why that model was chosen
- ✅ Conversation history
- ✅ Real-time streaming responses
- ✅ Dark/light mode support

### For You (Admin)
- ✅ Full cost tracking per user
- ✅ Usage analytics
- ✅ Abuse monitoring
- ✅ Tier management
- ✅ Model performance stats

## 📂 Project Structure

```
lib/
├── llm/
│   ├── models.ts              # Model configs & rankings
│   ├── prompt-analyzer.ts     # Task categorization
│   ├── model-selector.ts      # Selection algorithm
│   └── router.ts              # LLM API integration
├── rate-limiter.ts            # Rate limiting & abuse prevention
├── supabase/
│   ├── conversations.ts       # Conversation management
│   └── messages.ts            # Message storage
└── db-schema.sql              # Database schema

app/
├── page.tsx                   # Landing page
├── chat/
│   └── page.tsx              # Main chat interface
├── admin/
│   └── page.tsx              # Admin dashboard
└── api/
    ├── chat/route.ts         # Chat streaming endpoint
    ├── conversations/        # Conversation APIs
    └── user/usage/          # Usage stats

components/
└── chat/
    ├── message.tsx           # Message display
    ├── chat-input.tsx        # Input form
    ├── model-badge.tsx       # Model indicator
    ├── conversation-list.tsx # Sidebar
    └── upgrade-prompt.tsx    # Upgrade prompts
```

## 🔧 Customization

### Adjust Tier Limits

Edit `lib/rate-limiter.ts` to change:
- Token limits
- Request rate limits
- Model access by tier

### Update Model Rankings

Edit `lib/llm/models.ts` to:
- Add new models
- Update LMArena rankings
- Change cost data

### Modify Freemium Limits

Edit `lib/llm/models.ts` → `FREEMIUM_STRATEGY` to adjust:
- When to show upgrade prompts
- Abuse detection thresholds
- Typical user metrics

## 🚨 Important Notes

1. **API Costs**: You pay for the LLM API calls. Monitor your usage in the admin dashboard!

2. **Start Small**: Begin with just OpenAI (GPT-4o Mini) and add other providers later

3. **Rate Limits**: The free tier limits are designed to keep costs under $5/month per user

4. **Database**: Don't forget to run the SQL schema in Supabase!

5. **Testing**: Create a test user account to try the chat interface

## 📈 Monitoring Costs

Watch your costs in:
1. **Admin Dashboard** (`/admin`) - Platform-wide costs
2. **OpenAI Dashboard** - Your API usage
3. **Anthropic Console** - Claude API usage
4. **Google AI Studio** - Gemini usage

Set up billing alerts in each provider's dashboard!

## 🐛 Troubleshooting

### "Unauthorized" errors
- Check Supabase env vars are correct
- Ensure database schema is created
- Try signing up with a new account

### "API key not configured" errors
- Verify API keys in `.env.local`
- Restart dev server after adding keys
- Check for typos in key names

### No messages saving
- Confirm database tables exist
- Check Supabase RLS policies
- Look for errors in server logs

## 🎉 Next Steps

1. ✅ Sign up for an account
2. ✅ Try the chat interface at `/chat`
3. ✅ Test different prompt types (coding, creative, math)
4. ✅ Watch the model selection in action
5. ✅ Check the admin dashboard at `/admin`

## 💡 Tips for Typical User Freemium Limits

Based on my recommendations in the code:

**Free Tier** is good for:
- Casual users: ~20 requests/day
- Average ~250 tokens per request
- Monthly usage: ~5K tokens = well under limit

**Consider showing upgrade prompt when**:
- User hits 80% of token limit
- User makes 150+ requests in a month
- User has less than 20 requests remaining today

This keeps free tier sustainable while encouraging power users to upgrade.

---

**Questions?** Check the code comments or reach out for support!

Built with ❤️ using Next.js, Supabase, and the best LLMs
