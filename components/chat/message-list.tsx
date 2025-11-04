// Message List Component - Displays all messages in a conversation

'use client';

import { useEffect, useRef } from 'react';
import { Message as MessageType } from '@/lib/types';
import { Message } from './message';

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
    <div className="flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center p-8 text-center">
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
        <div className="divide-y divide-border">
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}

          {isLoading && (
            <div className="flex gap-4 p-4 bg-muted/50">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-sm font-semibold">
                  🤖
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
