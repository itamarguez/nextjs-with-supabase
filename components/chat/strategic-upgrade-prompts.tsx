// Strategic Upgrade Prompts - Context-aware suggestions to upgrade

'use client';

import { UserTier } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Zap, X } from 'lucide-react';
import { useState } from 'react';

interface StrategyType {
  type: 'after_great_answer' | 'power_user' | 'better_model_available' | 'premium_credits_low';
  modelUsed?: string;
  betterModel?: string;
  premiumCreditsLeft?: number;
}

interface StrategyPromptProps {
  strategy: StrategyType;
  currentTier: UserTier;
  onUpgrade: () => void;
  onDismiss: () => void;
}

export function StrategyPrompt({
  strategy,
  currentTier,
  onUpgrade,
  onDismiss,
}: StrategyPromptProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss();
  };

  // After getting a great answer
  if (strategy.type === 'after_great_answer') {
    return (
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader className="relative pb-3">
          <button
            onClick={handleDismiss}
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Loved this answer?</CardTitle>
          </div>
          <CardDescription>
            {strategy.modelUsed} just gave you a great response. With Pro tier, you get unlimited access to premium models like this!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={onUpgrade} size="sm">
            Upgrade to Pro - $20/mo
          </Button>
          <Button onClick={handleDismiss} variant="ghost" size="sm">
            Maybe later
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Power user - using platform a lot
  if (strategy.type === 'power_user') {
    return (
      <Card className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
        <CardHeader className="relative pb-3">
          <button
            onClick={handleDismiss}
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <CardTitle className="text-lg">You're a power user!</CardTitle>
          </div>
          <CardDescription>
            You're getting serious value from NoMoreFOMO. Upgrade to Pro for 10x more capacity and access to all premium models.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={onUpgrade} size="sm" className="bg-orange-600 hover:bg-orange-700">
            Upgrade to Pro
          </Button>
          <Button onClick={handleDismiss} variant="ghost" size="sm">
            Not now
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Better model available (show what they're missing)
  if (strategy.type === 'better_model_available' && strategy.betterModel) {
    return (
      <Card className="border-purple-500/50 bg-purple-50 dark:bg-purple-950/20">
        <CardHeader className="relative pb-3">
          <button
            onClick={handleDismiss}
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900">Better Model Available</Badge>
          </div>
          <CardDescription className="mt-2">
            This answer was from {strategy.modelUsed}. With Pro, <strong>{strategy.betterModel}</strong> would have answered - it's ranked #1 for this type of task!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={onUpgrade} size="sm" className="bg-purple-600 hover:bg-purple-700">
            Try Pro - Get Better Answers
          </Button>
          <Button onClick={handleDismiss} variant="ghost" size="sm">
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Premium credits running low
  if (strategy.type === 'premium_credits_low' && strategy.premiumCreditsLeft !== undefined) {
    return (
      <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
        <CardHeader className="relative pb-3">
          <button
            onClick={handleDismiss}
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <CardTitle className="text-lg">Only {strategy.premiumCreditsLeft} premium answers left</CardTitle>
          </div>
          <CardDescription>
            You're loving the premium models! Upgrade to Pro for 200 premium answers per month instead of just 10.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={onUpgrade} size="sm" className="bg-yellow-600 hover:bg-yellow-700">
            Upgrade to Pro
          </Button>
          <Button onClick={handleDismiss} variant="ghost" size="sm">
            Not yet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
