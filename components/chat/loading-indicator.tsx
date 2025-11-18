// Loading Progress Indicator - Shows multi-stage progress during LLM processing
'use client';

import { useEffect, useState } from 'react';
import { Loader2, Brain, Sparkles, MessageSquare } from 'lucide-react';

interface LoadingStage {
  icon: React.ReactNode;
  text: string;
  duration: number; // milliseconds
}

const LOADING_STAGES: LoadingStage[] = [
  {
    icon: <Brain className="h-5 w-5" />,
    text: 'Analyzing your prompt...',
    duration: 1000,
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    text: 'Selecting the best LLM for this task...',
    duration: 1500,
  },
  {
    icon: <MessageSquare className="h-5 w-5" />,
    text: 'Getting the best answer for you...',
    duration: 999999, // Stays until response arrives
  },
];

export function LoadingIndicator() {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (currentStage >= LOADING_STAGES.length - 1) {
      // Stay on last stage
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStage((prev) => Math.min(prev + 1, LOADING_STAGES.length - 1));
    }, LOADING_STAGES[currentStage].duration);

    return () => clearTimeout(timer);
  }, [currentStage]);

  const stage = LOADING_STAGES[currentStage];

  return (
    <div className="flex items-start gap-3 p-4 bg-muted/50">
      {/* AI Avatar */}
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-sm font-semibold">
        🤖
      </div>

      {/* Loading Content */}
      <div className="flex-1 space-y-3">
        {/* Stage Indicator */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="animate-spin">{stage.icon}</div>
          <span className="animate-pulse">{stage.text}</span>
        </div>

        {/* Stage Pills */}
        <div className="flex gap-2">
          {LOADING_STAGES.map((s, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all ${
                idx < currentStage
                  ? 'bg-primary/20 text-primary'
                  : idx === currentStage
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {idx < currentStage ? (
                <span className="text-xs">✓</span>
              ) : idx === currentStage ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <span className="h-3 w-3 rounded-full border border-current" />
              )}
              <span className="hidden sm:inline">
                {idx === 0 ? 'Analyze' : idx === 1 ? 'Select' : 'Fetch'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
