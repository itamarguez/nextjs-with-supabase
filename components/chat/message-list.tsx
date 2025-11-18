// Message List Component - Displays all messages in a conversation

'use client';

import { useEffect, useRef } from 'react';
import { Message as MessageType } from '@/lib/types';
import { Message } from './message';
import { LoadingIndicator } from './loading-indicator';

interface MessageListProps {
  messages: MessageType[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center p-4 md:p-8 text-center">
          <div className="space-y-4">
            <div className="text-6xl">💬</div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">NoMoreFOMO</h2>
              <p className="text-muted-foreground">
                Get the best answer from the best model.
                <br />
                Start chatting below!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-4xl divide-y divide-border">
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}

          {isLoading && <LoadingIndicator />}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
