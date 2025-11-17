// Individual Message Component

import { Message as MessageType } from '@/lib/types';
import { ModelBadge } from './model-badge';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex w-full gap-4 p-4',
        isUser ? 'bg-background' : 'bg-muted/50'
      )}
    >
      <div className="flex-shrink-0">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          )}
        >
          {isUser ? 'You' : '🤖'}
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <ReactMarkdown>{message.content}</ReactMarkdown>
          )}
        </div>

        {!isUser && message.model_used && message.task_category && (
          <ModelBadge
            modelName={message.model_used}
            category={message.task_category}
            reason={message.selection_reason}
          />
        )}
      </div>
    </div>
  );
}
