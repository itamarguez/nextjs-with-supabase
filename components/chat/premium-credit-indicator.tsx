// Premium Credit Indicator - Shows remaining premium requests

'use client';

import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PremiumCreditIndicatorProps {
  remaining: number;
  total: number;
  tier: string;
}

export function PremiumCreditIndicator({
  remaining,
  total,
  tier,
}: PremiumCreditIndicatorProps) {
  // Don't show for Pro/Unlimited users (they have different limits)
  if (tier !== 'free') {
    return null;
  }

  const percentage = (remaining / total) * 100;
  const isLow = remaining <= 3;
  const isOut = remaining === 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={isOut ? 'destructive' : isLow ? 'secondary' : 'default'}
            className="flex items-center gap-1 cursor-help"
          >
            <Sparkles className="h-3 w-3" />
            <span>
              {remaining}/{total} Premium
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-sm">
            {isOut ? (
              <>
                You've used all your premium answers this month! Upgrade to Pro for 200/month.
              </>
            ) : (
              <>
                You have <strong>{remaining}</strong> premium answers left this month.
                Use them to access Claude Haiku and other top-ranked models.
              </>
            )}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
