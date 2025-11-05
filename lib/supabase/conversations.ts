// NoMoreFOMO Conversation Management

import { createClient } from './server';
import { Conversation, Message } from '../types';

/**
 * Create a new conversation
 */
export async function createConversation(
  userId: string,
  title: string = 'New Conversation'
): Promise<Conversation | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: userId,
      title,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    return null;
  }

  return data;
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(
  userId: string
): Promise<Conversation[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  return data || [];
}

/**
 * Get a specific conversation
 */
export async function getConversation(
  conversationId: string,
  userId: string
): Promise<Conversation | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching conversation:', error);
    return null;
  }

  return data;
}

/**
 * Update conversation title
 */
export async function updateConversationTitle(
  conversationId: string,
  userId: string,
  title: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('conversations')
    .update({ title })
    .eq('id', conversationId)
    .eq('user_id', userId)
    .select();

  if (error) {
    console.error('Error updating conversation title:', error);
    return false;
  }

  console.log('Title update result:', data);
  return true;
}

/**
 * Delete a conversation
 */
export async function deleteConversation(
  conversationId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting conversation:', error);
    return false;
  }

  return true;
}

/**
 * Update conversation usage stats (admin only - hidden from users)
 */
export async function updateConversationUsage(
  conversationId: string,
  tokensUsed: number,
  costUsd: number
): Promise<void> {
  const supabase = await createClient();

  const { data: conversation } = await supabase
    .from('conversations')
    .select('total_tokens, total_cost_usd')
    .eq('id', conversationId)
    .single();

  if (conversation) {
    await supabase
      .from('conversations')
      .update({
        total_tokens: conversation.total_tokens + tokensUsed,
        total_cost_usd: conversation.total_cost_usd + costUsd,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId);
  }
}

/**
 * Generate a meaningful title for a conversation based on first message
 */
export function generateConversationTitle(firstMessage: string): string {
  const message = firstMessage.toLowerCase().trim();

  // Check for common patterns and generate descriptive titles

  // Questions
  if (message.includes('how to') || message.includes('how do')) {
    const topic = extractMainTopic(firstMessage);
    return `How to ${topic}`;
  }

  if (message.includes('what is') || message.includes('what are')) {
    const topic = extractMainTopic(firstMessage);
    return `About ${topic}`;
  }

  if (message.includes('why') && message.includes('?')) {
    const topic = extractMainTopic(firstMessage);
    return `Why ${topic}`;
  }

  // Actions/Commands
  if (message.startsWith('write') || message.startsWith('create')) {
    const topic = extractMainTopic(firstMessage);
    return `Create ${topic}`;
  }

  if (message.startsWith('explain') || message.startsWith('tell me')) {
    const topic = extractMainTopic(firstMessage);
    return `Explain ${topic}`;
  }

  if (message.startsWith('fix') || message.startsWith('debug')) {
    return 'Debug Issue';
  }

  if (message.startsWith('help')) {
    const topic = extractMainTopic(firstMessage);
    return `Help with ${topic}`;
  }

  // Code-related
  if (message.includes('function') || message.includes('code') || message.includes('script')) {
    const topic = extractMainTopic(firstMessage);
    return `Code: ${topic}`;
  }

  if (message.includes('api') || message.includes('endpoint')) {
    return 'API Development';
  }

  if (message.includes('bug') || message.includes('error')) {
    return 'Bug Fix';
  }

  // Default: Take first meaningful sentence
  const firstLine = firstMessage.split('\n')[0].trim();
  const truncated = firstLine.substring(0, 50).trim();

  if (truncated.length < firstLine.length) {
    return truncated + '...';
  }

  return truncated || 'New Conversation';
}

/**
 * Extract the main topic from a message
 */
function extractMainTopic(message: string): string {
  // Remove common starting phrases
  let topic = message
    .replace(/^(how to|how do i|what is|what are|why|write|create|explain|tell me about|help me with|help with)/i, '')
    .replace(/\?/g, '')
    .trim();

  // Take first meaningful part
  const words = topic.split(' ');
  const mainTopic = words.slice(0, 5).join(' ');

  // Capitalize first letter
  return mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1);
}
