// Chat Input Component - Message input form

'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // On desktop: Submit on Enter (without Shift)
    // On mobile: Let Enter create newline, user taps Send button
    if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
  };

  return (
    <div className="border-t border-border bg-background p-4">
      <div className="mx-auto max-w-4xl">
        <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ maxHeight: '200px' }}
        />
        <Button
          onClick={handleSubmit}
          disabled={disabled || !message.trim()}
          size="icon"
          className="h-auto self-end px-4 py-3"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

        <div className="mt-2 text-xs text-muted-foreground">
          {isMobile ? (
            <>Tap <Send className="inline h-3 w-3" /> to send</>
          ) : (
            <>
              Press <kbd className="rounded bg-muted px-1.5 py-0.5">Enter</kbd> to send,{' '}
              <kbd className="rounded bg-muted px-1.5 py-0.5">Shift</kbd> +{' '}
              <kbd className="rounded bg-muted px-1.5 py-0.5">Enter</kbd> for new line
            </>
          )}
        </div>
      </div>
    </div>
  );
}
