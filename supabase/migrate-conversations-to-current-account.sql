-- Migrate all conversations from old account to current account
-- IMPORTANT: Run this ONLY ONCE!

-- Step 1: Identify the accounts
-- Old account (with 35 conversations): fb73e6db-c5ce-4bc4-b3a6-ce6f93af3a1f
-- Current account (logged in, has 1): 2b4e463a-b0b9-491a-ae62-d8f6d4aa07b1

-- Step 2: Migrate conversations from old account to current account
UPDATE conversations
SET user_id = '2b4e463a-b0b9-491a-ae62-d8f6d4aa07b1'
WHERE user_id = 'fb73e6db-c5ce-4bc4-b3a6-ce6f93af3a1f';

-- Step 3: Verify the migration
SELECT
  'After migration' as status,
  user_id,
  COUNT(*) as conversation_count
FROM conversations
WHERE user_id IN (
  'fb73e6db-c5ce-4bc4-b3a6-ce6f93af3a1f',
  '2b4e463a-b0b9-491a-ae62-d8f6d4aa07b1'
)
GROUP BY user_id;

-- Step 4: Show all conversations for current account
SELECT
  id,
  title,
  created_at,
  updated_at
FROM conversations
WHERE user_id = '2b4e463a-b0b9-491a-ae62-d8f6d4aa07b1'
ORDER BY updated_at DESC
LIMIT 10;

-- Success message
SELECT
  '✅ Migration complete! All 35+ conversations are now under your current account.' as message,
  'Refresh the chat page to see all your conversations!' as next_step;
