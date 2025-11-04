// Conversation List Sidebar Component

'use client';

import { Conversation } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationListProps {
  conversations: Conversation[];
  currentConversationId?: string;
  onSelect: (conversationId: string) => void;
  onNew: () => void;
}

export function ConversationList({
  conversations,
  currentConversationId,
  onSelect,
  onNew,
}: ConversationListProps) {
  return (
    <div className="flex h-full flex-col border-r border-border bg-muted/10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="font-semibold">Conversations</h2>
        <Button onClick={onNew} size="icon" variant="ghost">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No conversations yet.
            <br />
            Start one!
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelect(conversation.id)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-lg p-3 text-left text-sm transition-colors hover:bg-muted',
                  currentConversationId === conversation.id &&
                    'bg-muted font-medium'
                )}
              >
                <MessageSquare className="h-4 w-4 flex-shrink-0 mt-0.5 text-muted-foreground" />
                <div className="flex-1 overflow-hidden">
                  <p className="truncate">{conversation.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(conversation.created_at).toLocaleDateString()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
