-- Find all user accounts and conversations for your email

-- STEP 1: Find all your user accounts
SELECT
  id as user_id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE email = 'itamar.guez@gmail.com'
ORDER BY created_at DESC;

-- STEP 2: Find all conversations across all your user accounts
SELECT
  c.id as conversation_id,
  c.user_id,
  c.title,
  c.created_at,
  c.updated_at,
  (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as message_count
FROM conversations c
WHERE c.user_id IN (
  SELECT id FROM auth.users WHERE email = 'itamar.guez@gmail.com'
)
ORDER BY c.updated_at DESC;

-- STEP 3: Find your current user_id (the one you're logged in as)
SELECT
  up.id as current_user_id,
  up.tier,
  u.email,
  u.created_at as account_created
FROM user_profiles up
JOIN auth.users u ON up.id = u.id
WHERE u.email = 'itamar.guez@gmail.com'
ORDER BY u.created_at DESC
LIMIT 1;

-- STEP 4: Count conversations per user account
SELECT
  u.id as user_id,
  u.email,
  u.created_at as account_created,
  COUNT(c.id) as conversation_count
FROM auth.users u
LEFT JOIN conversations c ON c.user_id = u.id
WHERE u.email = 'itamar.guez@gmail.com'
GROUP BY u.id, u.email, u.created_at
ORDER BY conversation_count DESC;
