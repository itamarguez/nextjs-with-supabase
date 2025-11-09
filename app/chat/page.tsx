// Main Chat Page

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Message as MessageType, Conversation, UserTier } from '@/lib/types';
import { MessageList } from '@/components/chat/message-list';
import { ChatInput } from '@/components/chat/chat-input';
import { ConversationList } from '@/components/chat/conversation-list';
import { UpgradePrompt, LimitReached } from '@/components/chat/upgrade-prompt';
import { recommendTierUpgrade } from '@/lib/llm/model-selector';
import { PremiumCreditIndicator } from '@/components/chat/premium-credit-indicator';
import { StrategyPrompt } from '@/components/chat/strategic-upgrade-prompts';
import { LogoutButton } from '@/components/logout-button';
import { PageViewTracker } from '@/components/analytics/page-view-tracker';
import { Analytics } from '@/lib/analytics/tracker';

export default function ChatPage() {
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [userTier, setUserTier] = useState<UserTier>('free');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeSuggestion, setUpgradeSuggestion] = useState<{
    suggestedTier: UserTier;
    reasons: string[];
  } | null>(null);
  const [limitReached, setLimitReached] = useState<{
    type: 'monthly_tokens' | 'day' | 'hour' | 'minute';
  } | null>(null);
  const [tokensUsedPercent, setTokensUsedPercent] = useState(0);

  // Premium credits tracking (hybrid model)
  const [premiumCreditsRemaining, setPremiumCreditsRemaining] = useState<number>(10);
  const [premiumCreditsLimit, setPremiumCreditsLimit] = useState<number>(10);
  const [strategyPrompt, setStrategyPrompt] = useState<{
    type: 'after_great_answer' | 'power_user' | 'better_model_available' | 'premium_credits_low';
    modelUsed?: string;
    betterModel?: string;
    premiumCreditsLeft?: number;
  } | null>(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
    checkUserTierAndUsage();
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId);
    }
  }, [currentConversationId]);

  async function loadConversations(autoSelect: boolean = true) {
    try {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/conversations?t=${timestamp}`, {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded conversations:', data.conversations);
        setConversations(data.conversations || []);

        // Auto-select first conversation or create new one (only on initial load)
        if (autoSelect) {
          if (data.conversations?.length > 0) {
            setCurrentConversationId(data.conversations[0].id);
          } else {
            await createNewConversation();
          }
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }

  async function loadMessages(conversationId: string) {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }

  async function createNewConversation() {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Conversation' }),
      });

      if (response.ok) {
        const data = await response.json();
        setConversations((prev) => [data.conversation, ...prev]);
        setCurrentConversationId(data.conversation.id);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  }

  async function checkUserTierAndUsage() {
    try {
      const response = await fetch('/api/user/usage');

      // If user profile doesn't exist (500 error), redirect to fix-profile
      if (response.status === 500) {
        const errorData = await response.json();
        if (errorData.error?.includes('User profile not found')) {
          router.push('/fix-profile');
          return;
        }
      }

      if (response.ok) {
        const data = await response.json();
        setUserTier(data.tier);
        setTokensUsedPercent(data.percentageUsed);

        // Set premium credits (hybrid model)
        if (data.premiumRequestsRemaining !== undefined) {
          setPremiumCreditsRemaining(data.premiumRequestsRemaining);
        }
        if (data.premiumRequestsLimit !== undefined) {
          setPremiumCreditsLimit(data.premiumRequestsLimit);
        }

        // Check if user should see upgrade prompt
        const recommendation = recommendTierUpgrade(
          data.tier,
          data.tokensUsed,
          data.requestsToday
        );

        if (recommendation.shouldUpgrade && recommendation.suggestedTier) {
          setUpgradeSuggestion({
            suggestedTier: recommendation.suggestedTier,
            reasons: recommendation.reasons,
          });

          // Show upgrade prompt at 90% usage
          if (data.percentageUsed >= 90) {
            setShowUpgradePrompt(true);
          }
        }
      }
    } catch (error) {
      console.error('Error checking user usage:', error);
    }
  }

  async function handleSendMessage(message: string) {
    if (!currentConversationId || isLoading) return;

    setIsLoading(true);
    setStreamingMessage('');
    setLimitReached(null);

    // Add user message optimistically
    const userMessage: MessageType = {
      id: `temp-${Date.now()}`,
      conversation_id: currentConversationId,
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Track analytics for first message
    if (messages.filter((m) => m.role === 'user').length === 0) {
      Analytics.firstMessageSent();
      Analytics.conversationStarted();
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: currentConversationId,
          message,
        }),
      });

      if (!response.ok) {
        const error = await response.json();

        // Handle rate limiting
        if (response.status === 429 && error.limitType) {
          setLimitReached({ type: error.limitType });
          // Remove optimistic user message
          setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
          setIsLoading(false);
          return;
        }

        throw new Error(error.error || 'Failed to send message');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let modelInfo: {
        model?: string;
        category?: string;
        reason?: string;
        isPremium?: boolean;
        betterModelAvailable?: string;
      } = {};

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'chunk') {
                assistantMessage += data.text;
                setStreamingMessage(assistantMessage);
                modelInfo = {
                  model: data.model,
                  category: data.category,
                  reason: data.reason,
                  isPremium: data.isPremium,
                  betterModelAvailable: data.betterModelAvailable,
                };
              } else if (data.type === 'done') {
                // Update premium credits (hybrid model)
                if (data.premiumCreditsRemaining !== undefined) {
                  setPremiumCreditsRemaining(data.premiumCreditsRemaining);
                }
                if (data.premiumCreditsLimit !== undefined) {
                  setPremiumCreditsLimit(data.premiumCreditsLimit);
                }

                // Strategic upgrade prompts
                if (userTier === 'free') {
                  // Show "after great answer" prompt when free user uses premium model
                  if (data.isPremium && modelInfo.model) {
                    setStrategyPrompt({
                      type: 'after_great_answer',
                      modelUsed: modelInfo.model,
                    });
                  }
                  // Show "better model available" when there's a better model
                  else if (data.betterModelAvailable && modelInfo.model) {
                    setStrategyPrompt({
                      type: 'better_model_available',
                      modelUsed: modelInfo.model,
                      betterModel: data.betterModelAvailable,
                    });
                  }
                  // Show "premium credits low" when <=3 remaining
                  else if (data.premiumCreditsRemaining !== undefined && data.premiumCreditsRemaining <= 3 && data.premiumCreditsRemaining > 0) {
                    setStrategyPrompt({
                      type: 'premium_credits_low',
                      premiumCreditsLeft: data.premiumCreditsRemaining,
                    });
                  }
                }

                // Reload messages to get saved version with metadata
                await loadMessages(currentConversationId);
                await checkUserTierAndUsage(); // Update usage stats

                // Delay then reload conversations to show updated title
                console.log('Waiting to reload conversations...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log('Reloading conversations to get updated title...');
                await loadConversations(false);

                setStreamingMessage('');
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic user message on error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      alert(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }

  // Combine regular messages with streaming message
  const displayMessages = [
    ...messages,
    ...(streamingMessage
      ? [
          {
            id: 'streaming',
            conversation_id: currentConversationId || '',
            role: 'assistant' as const,
            content: streamingMessage,
            created_at: new Date().toISOString(),
          },
        ]
      : []),
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Analytics tracking */}
      <PageViewTracker />
      {/* Sidebar */}
      <div className="w-64 hidden md:flex flex-col border-r bg-background">
        <div className="flex flex-col h-full">
          {/* Premium Credit Indicator (only for free tier) */}
          <div className="p-4 border-b">
            <PremiumCreditIndicator
              remaining={premiumCreditsRemaining}
              total={premiumCreditsLimit}
              tier={userTier}
            />
          </div>

          <div className="flex-1 overflow-hidden">
            <ConversationList
              conversations={conversations}
              currentConversationId={currentConversationId || undefined}
              onSelect={setCurrentConversationId}
              onNew={createNewConversation}
            />
          </div>

          {/* Logout Button at Bottom */}
          <div className="mt-auto p-4 border-t">
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {limitReached ? (
          <div className="flex h-full items-center justify-center p-4">
            <LimitReached
              limitType={limitReached.type}
              currentTier={userTier}
              onUpgrade={() => router.push('/pricing')}
            />
          </div>
        ) : (
          <>
            {/* Strategic Upgrade Prompt */}
            {strategyPrompt && (
              <div className="p-4">
                <StrategyPrompt
                  strategy={strategyPrompt}
                  currentTier={userTier}
                  onUpgrade={() => router.push('/pricing')}
                  onDismiss={() => setStrategyPrompt(null)}
                />
              </div>
            )}

            <MessageList messages={displayMessages} isLoading={isLoading} />
            <ChatInput onSend={handleSendMessage} disabled={isLoading} />
          </>
        )}
      </div>

      {/* Upgrade Prompt */}
      {showUpgradePrompt && upgradeSuggestion && (
        <UpgradePrompt
          currentTier={userTier}
          suggestedTier={upgradeSuggestion.suggestedTier}
          reasons={upgradeSuggestion.reasons}
          tokensUsedPercent={tokensUsedPercent}
          onClose={() => setShowUpgradePrompt(false)}
        />
      )}
    </div>
  );
}
