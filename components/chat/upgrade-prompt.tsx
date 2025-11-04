// Upgrade Prompt Component - Shows when users approach limits

'use client';

import { UserTier } from '@/lib/types';
import { TIER_PRICING } from '@/lib/llm/models';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap } from 'lucide-react';

interface UpgradePromptProps {
  currentTier: UserTier;
  suggestedTier: UserTier;
  reasons: string[];
  tokensUsedPercent: number;
  onClose: () => void;
}

export function UpgradePrompt({
  currentTier,
  suggestedTier,
  reasons,
  tokensUsedPercent,
  onClose,
}: UpgradePromptProps) {
  const tierInfo = TIER_PRICING[suggestedTier];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              <Zap className="mr-1 h-3 w-3" />
              Upgrade Available
            </Badge>
            {tokensUsedPercent > 0 && (
              <span className="text-sm text-muted-foreground">
                {tokensUsedPercent.toFixed(0)}% used this month
              </span>
            )}
          </div>
          <CardTitle className="mt-4">
            Upgrade to {tierInfo.name}
          </CardTitle>
          <CardDescription>
            {reasons.length > 0 && reasons[0]}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Pricing */}
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">${tierInfo.price}</span>
            <span className="text-muted-foreground">/month</span>
          </div>

          {/* Features */}
          <ul className="space-y-2">
            {tierInfo.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <Check className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Reasons */}
          {reasons.length > 1 && (
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <p className="text-sm font-medium">Why upgrade now?</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {reasons.slice(1).map((reason, index) => (
                  <li key={index}>• {reason}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Maybe Later
          </Button>
          <Button className="flex-1">
            Upgrade Now
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

/**
 * Limit Reached Component - Hard block when limits exceeded
 */
interface LimitReachedProps {
  limitType: 'monthly_tokens' | 'day' | 'hour' | 'minute';
  currentTier: UserTier;
  onUpgrade: () => void;
}

export function LimitReached({ limitType, currentTier, onUpgrade }: LimitReachedProps) {
  const messages = {
    monthly_tokens: {
      title: 'Monthly Token Limit Reached',
      description: 'You\'ve used all your tokens for this month.',
    },
    day: {
      title: 'Daily Request Limit Reached',
      description: 'You\'ve reached your daily request limit. Try again tomorrow.',
    },
    hour: {
      title: 'Hourly Limit Reached',
      description: 'You\'re sending requests too quickly. Please wait a bit.',
    },
    minute: {
      title: 'Slow Down!',
      description: 'Too many requests per minute. Take a short break.',
    },
  };

  const message = messages[limitType] || messages.day;

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>{message.title}</CardTitle>
        <CardDescription>{message.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground">
          Upgrade to a higher tier for more capacity and access to premium models.
        </p>
      </CardContent>

      <CardFooter>
        <Button onClick={onUpgrade} className="w-full">
          View Upgrade Options
        </Button>
      </CardFooter>
    </Card>
  );
}
