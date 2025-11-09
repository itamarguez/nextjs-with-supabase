# Database Security Audit - NoMoreFOMO

**Audit Date:** 2025-11-09
**Status:** ✅ SECURE

---

## Summary

All conversation data is being stored securely with proper Row-Level Security (RLS) policies. The database has two separate conversation storage systems:

1. **Authenticated Users** → `conversations` + `messages` tables (RLS enabled)
2. **Anonymous Trial Users** → `anonymous_conversations` table (no RLS, server-only access)

---

## 1. Authenticated User Conversations

### Tables
- **`conversations`** - Stores conversation metadata
- **`messages`** - Stores individual messages within conversations

### Data Stored
```sql
conversations:
  - id (UUID)
  - user_id (references auth.users)
  - title (e.g., "Help with Python code")
  - total_tokens (admin analytics)
  - total_cost_usd (admin analytics)
  - created_at, updated_at

messages:
  - id (UUID)
  - conversation_id (references conversations)
  - role (user/assistant/system)
  - content (the actual message text)
  - model_used (e.g., "gpt-4o-mini")
  - task_category (e.g., "coding")
  - selection_reason (why this model was chosen)
  - tokens_used (admin analytics)
  - cost_usd (admin analytics)
  - latency_ms (admin analytics)
  - created_at
```

### Row-Level Security (RLS) Policies

**✅ ENABLED** on both tables

**Policies:**
```sql
-- Conversations
✅ "Users can view own conversations"
   FOR SELECT USING (auth.uid() = user_id)

✅ "Users can create own conversations"
   FOR INSERT WITH CHECK (auth.uid() = user_id)

✅ "Users can update own conversations"
   FOR UPDATE USING (auth.uid() = user_id)

-- Messages
✅ "Users can view messages in their conversations"
   FOR SELECT USING (
     EXISTS (
       SELECT 1 FROM conversations
       WHERE conversations.id = messages.conversation_id
       AND conversations.user_id = auth.uid()
     )
   )

✅ "Users can insert messages in their conversations"
   FOR INSERT WITH CHECK (
     EXISTS (
       SELECT 1 FROM conversations
       WHERE conversations.id = messages.conversation_id
       AND conversations.user_id = auth.uid()
     )
   )
```

### Security Analysis

**What users CAN do:**
- ✅ View their own conversations
- ✅ Create new conversations
- ✅ Update their own conversations (e.g., titles)
- ✅ View messages in their own conversations
- ✅ Add messages to their own conversations

**What users CANNOT do:**
- ❌ View other users' conversations
- ❌ View other users' messages
- ❌ Modify other users' data
- ❌ See cost/token analytics (hidden by API, not exposed to client)

**Admin Access:**
- Server-side code can access all data
- Cost/token/analytics fields are never sent to client
- Admin dashboard uses server-side queries (bypasses RLS)

---

## 2. Anonymous Trial Conversations

### Table
- **`anonymous_conversations`** - Stores trial chat data before signup

### Data Stored
```sql
anonymous_conversations:
  - id (UUID)
  - session_id (cookie-based identifier: "anon_1699564832_abc123")
  - user_prompt (user's message)
  - assistant_response (AI's response)
  - model_used (e.g., "gpt-4o-mini")
  - task_category (e.g., "general")
  - selection_reason (why this model was chosen)
  - tokens_used (admin analytics)
  - cost_usd (admin analytics)
  - latency_ms (performance tracking)
  - ip_address (abuse prevention)
  - user_agent (analytics)
  - claimed_by_user_id (NULL until user signs up)
  - claimed_at (timestamp when linked to account)
  - created_at
```

### Row-Level Security (RLS) Policies

**❌ NO RLS** - By design (server-only access)

**Why no RLS?**
```sql
-- From migration file:
-- "No RLS needed - this table is only accessed by server-side code"
-- "Never exposed to client via Supabase client library"
```

### Security Analysis

**Access Control:**
- ✅ Table is NEVER queried from client-side code
- ✅ Only `/app/api/chat/anonymous/route.ts` writes to this table (server-side)
- ✅ Only admin dashboard reads from this table (server-side)
- ✅ Client has no access to Supabase client for this table

**Data Protection:**
- Cookie-based session tracking (30-day expiration)
- IP address stored for abuse prevention
- User agent stored for analytics
- No personally identifiable information (PII) except IP

**Future User Linking:**
- `claimed_by_user_id` field allows linking anonymous chats to user accounts
- If user signs up, their trial conversations can be imported into their account
- This requires manual implementation (not yet built)

---

## 3. Database Indexes

### Performance Indexes
```sql
-- Conversations
✅ idx_conversations_user_id (fast user lookup)
✅ idx_conversations_created_at (ordered retrieval)

-- Messages
✅ idx_messages_conversation_id (fast conversation lookup)
✅ idx_messages_created_at (ordered retrieval)

-- Anonymous Conversations
✅ idx_anonymous_session_id (group by session)
✅ idx_anonymous_created_at (ordered retrieval)
✅ idx_anonymous_claimed_by (find unclaimed conversations)
✅ idx_anonymous_ip_address (abuse detection)
```

---

## 4. API Endpoints and Data Flow

### Authenticated Chat Flow
```
Client → POST /api/chat
  ↓
  1. Check auth (requires valid session)
  2. Validate user_id matches conversation owner
  3. Check rate limits
  4. Save user message to `messages` table
  5. Stream LLM response
  6. Save assistant message to `messages` table
  7. Update `conversations` usage stats
  ↓
Client receives streaming response
```

**Security:**
- ✅ Authentication required
- ✅ RLS policies enforce user can only access own data
- ✅ Cost/token data never sent to client
- ✅ Server-side validation of conversation ownership

### Anonymous Chat Flow
```
Client → POST /api/chat/anonymous
  ↓
  1. Check IP rate limit (prevent abuse)
  2. Check cookie trial count (max 3 messages)
  3. NO authentication required
  4. Stream LLM response
  5. Save to `anonymous_conversations` table (server-side only)
  6. Set cookies (trial count + session ID)
  ↓
Client receives streaming response
```

**Security:**
- ✅ IP-based rate limiting
- ✅ Cookie-based message limits
- ✅ Anonymous data never exposed to client
- ✅ Server-side only database writes
- ✅ No PII except IP address

---

## 5. Admin Access & Analytics

### Admin Dashboard
- Location: `/app/admin/page.tsx`
- Access: Restricted to admin email only (server-side check)
- Queries: Bypass RLS using service role key (server-side)

### What Admins Can See
- All users and their profiles
- All conversations (authenticated users)
- All anonymous trial conversations
- Usage metrics (tokens, costs, latency)
- Abuse logs and suspicious activity

### Security Notes
- Admin checks happen server-side BEFORE rendering page
- RLS policies don't apply to service role key
- Cost/analytics data only visible to admins
- No client-side queries for admin data

---

## 6. Potential Security Improvements

### Already Implemented ✅
- Row-Level Security on user tables
- IP-based rate limiting
- Cookie-based trial limits
- Server-side authentication checks
- Hidden cost/token analytics from users

### Future Enhancements (Optional)
1. **Anonymous Conversation Anonymization**
   - Hash IP addresses after 30 days
   - Remove user agent strings after analytics processed
   - Pseudonymize session IDs for long-term storage

2. **Audit Logging**
   - Log all admin access to user data
   - Track when conversations are viewed by admins
   - GDPR compliance trail

3. **Data Retention Policies**
   - Auto-delete unclaimed anonymous conversations after 90 days
   - Archive old authenticated conversations (1 year+)
   - GDPR right-to-be-forgotten implementation

4. **Additional RLS Policies**
   - Add DELETE policies (currently users can't delete conversations)
   - Add admin bypass policies (separate from service role)

---

## 7. Compliance Checklist

### GDPR Considerations
- ⚠️ IP addresses stored (considered PII in EU)
- ⚠️ No data export functionality yet
- ⚠️ No account deletion functionality yet
- ⚠️ No cookie consent banner (required for EU users)

### Privacy Policy Requirements
- ✅ Data collection disclosed in terms
- ✅ Purpose of data collection clear (analytics, abuse prevention)
- ⚠️ No explicit user consent for analytics tracking

### Recommendations
1. Add cookie consent banner for anonymous trial users
2. Implement data export (GDPR Article 20)
3. Implement account deletion (GDPR Article 17)
4. Consider hashing IP addresses after initial abuse check

---

## 8. Conclusion

**Overall Security Rating: ✅ GOOD**

**Strengths:**
- Proper RLS policies on user-facing tables
- Server-side only access to anonymous data
- IP-based abuse prevention
- Cost/analytics hidden from users
- Rate limiting on all endpoints

**Areas to Watch:**
- GDPR compliance (IP addresses, data export/deletion)
- Anonymous conversation retention policy
- Admin audit logging

**Next Steps:**
1. Continue to Phase 4 (Sponsored Ads) or Phase 5 (Admin Dashboard)
2. Consider GDPR compliance improvements before EU launch
3. Monitor anonymous conversation growth and implement cleanup policy

---

**Audited by:** Claude (AI Assistant)
**Review Status:** Ready for production use with noted GDPR considerations
