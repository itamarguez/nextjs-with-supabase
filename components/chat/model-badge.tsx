// Model Badge Component - Shows which model answered

import { Badge } from '@/components/ui/badge';
import { TaskCategory } from '@/lib/types';

interface ModelBadgeProps {
  modelName: string;
  category: TaskCategory;
  reason?: string;
}

const MODEL_DISPLAY_NAMES: Record<string, string> = {
  'gpt-4o-mini': 'GPT-4o Mini',
  'gemini-2.0-flash-thinking-exp-01-21': 'Gemini 2.0 Flash',
  'claude-3-5-haiku-20241022': 'Claude Haiku',
  'gpt-4o': 'GPT-4o',
  'claude-3-5-sonnet': 'Claude Sonnet',
};

const CATEGORY_ICONS: Record<TaskCategory, string> = {
  coding: '💻',
  creative: '✍️',
  math: '🧮',
  casual: '💬',
  data_analysis: '📊',
};

export function ModelBadge({ modelName, category, reason }: ModelBadgeProps) {
  const displayName = MODEL_DISPLAY_NAMES[modelName] || modelName;
  const icon = CATEGORY_ICONS[category] || '🤖';

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Badge variant="secondary" className="flex items-center gap-1">
        <span>{icon}</span>
        <span>{displayName}</span>
      </Badge>
      {reason && (
        <span className="hidden sm:inline" title={reason}>
          • {reason}
        </span>
      )}
    </div>
  );
}
