// Trial Chat Component - Instant Chat Demo on Landing Page
// 3 free messages before requiring signup

'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Analytics } from '@/lib/analytics/tracker';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  category?: string;
}

export function TrialChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messagesRemaining, setMessagesRemaining] = useState(4);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Check trial status on mount
  useEffect(() => {
    const checkTrialStatus = async () => {
      try {
        const response = await fetch('/api/chat/trial-status');
        if (response.ok) {
          const data = await response.json();
          setMessagesRemaining(data.messagesRemaining);
          if (data.limitReached) {
            setShowSignupPrompt(true);
          }
        } else {
          // If the endpoint fails, just use default value (3 messages)
          console.warn('Trial status check failed, using default');
        }
      } catch (error) {
        // Fail silently and use default trial count
        console.warn('Failed to check trial status, using default:', error);
      }
    };
    checkTrialStatus();
  }, []);

  // Auto-scroll to bottom (only within chat container, not the whole page)
  useEffect(() => {
    if (messagesContainerRef.current) {
      // Scroll the messages container to bottom
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingMessage('');

    // Track trial event analytics
    const messageNumber = messages.filter((m) => m.role === 'user').length + 1;
    if (messageNumber === 1) {
      Analytics.trialStarted();
    }
    Analytics.trialMessageSent(messageNumber);

    try {
      const response = await fetch('/api/chat/anonymous', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input.trim() }),
      });

      if (response.status === 403) {
        // Free trial limit reached
        Analytics.trialLimitReached();
        setShowSignupPrompt(true);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let modelInfo = { model: '', category: '' };
      let shouldShowSignup = false;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'metadata') {
                modelInfo = { model: data.model, category: data.category };
                setMessagesRemaining(data.messagesRemaining);
              } else if (data.type === 'chunk') {
                assistantMessage += data.text;
                setStreamingMessage(assistantMessage);
              } else if (data.type === 'done') {
                setMessagesRemaining(data.messagesRemaining);
                // Don't show signup yet - wait until message is displayed
                if (data.limitReached) {
                  shouldShowSignup = true;
                }
                break;
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            }
          }
        }
      }

      // Add final assistant message
      const finalMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: assistantMessage,
        model: modelInfo.model,
        category: modelInfo.category,
      };

      setMessages((prev) => [...prev, finalMessage]);
      setStreamingMessage('');

      // Show signup prompt AFTER message is added to state
      // Give user time to read the final response before showing signup modal
      if (shouldShowSignup) {
        setTimeout(() => {
          setShowSignupPrompt(true);
        }, 5000); // 5 second delay so user can fully read the response
      }
    } catch (error) {
      console.error('Chat error:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Combine messages with streaming message
  const displayMessages = [
    ...messages,
    ...(streamingMessage
      ? [
          {
            id: 'streaming',
            role: 'assistant' as const,
            content: streamingMessage,
          },
        ]
      : []),
  ];

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      {/* Chat Container */}
      <div className="rounded-lg border bg-card shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold">Try NoMoreFOMO</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {messagesRemaining} {messagesRemaining === 1 ? 'message' : 'messages'} remaining
          </div>
        </div>

        {/* Messages */}
        <div ref={messagesContainerRef} className="h-[400px] overflow-y-auto p-4">
          {messages.length === 0 && !streamingMessage ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="space-y-4">
                <div className="text-6xl">💬</div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Try it now - no signup required!</h3>
                  <p className="text-sm text-muted-foreground">
                    Ask anything - coding help, creative writing, math, or casual chat.
                    <br />
                    We'll automatically pick the best AI model for you.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {displayMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                      🤖
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    )}
                    {message.model && (
                      <p className="mt-1 text-xs opacity-70">
                        {message.model} • {message.category}
                      </p>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-sm font-semibold">
                      👤
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isLoading || showSignupPrompt}
              className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button type="submit" disabled={isLoading || showSignupPrompt || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>

      {/* Signup Prompt Overlay */}
      {showSignupPrompt && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/95 backdrop-blur-sm">
          <div className="max-w-md space-y-4 text-center p-8">
            <div className="text-5xl">🎉</div>
            <h3 className="text-2xl font-bold">You've seen what we can do!</h3>
            <p className="text-muted-foreground">
              You've used all 4 free trial messages. Sign up to keep chatting with the best AI models, automatically selected for each task.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button asChild size="lg" onClick={() => Analytics.signupClicked('trial_chat_limit')}>
                <Link href="/auth/sign-up">Sign Up - It's Free!</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/auth/login">Already have an account?</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Free tier: 100K tokens/month • 200 requests/day
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
