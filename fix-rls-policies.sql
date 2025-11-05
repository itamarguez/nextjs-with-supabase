-- Fix RLS Policies for Conversations Table
-- Run this in Supabase SQL Editor to allow users to update their own conversations

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;

-- Create policy to allow users to update their own conversations
CREATE POLICY "Users can update own conversations"
ON conversations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Verify the policy was created
SELECT * FROM pg_policies WHERE tablename = 'conversations';
