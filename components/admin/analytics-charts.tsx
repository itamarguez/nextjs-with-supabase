// Analytics Charts - Visualize usage trends and costs
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Message = {
  id: string;
  created_at: string;
  model_used?: string;
  cost_usd?: string;
  tokens?: number;
};

type Session = {
  user_id: string | null;
  started_at: string;
};

type Props = {
  messages: Message[];
  sessions: Session[];
};

export function AnalyticsCharts({ messages, sessions }: Props) {
  // Calculate daily costs for last 7 days
  const dailyCosts = useMemo(() => {
    const today = new Date();
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayCost = messages
        .filter(m => {
          const msgDate = new Date(m.created_at);
          return msgDate >= date && msgDate < nextDate;
        })
        .reduce((sum, m) => sum + parseFloat(m.cost_usd || '0'), 0);

      const dayMessages = messages.filter(m => {
        const msgDate = new Date(m.created_at);
        return msgDate >= date && msgDate < nextDate;
      }).length;

      days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        cost: dayCost,
        messages: dayMessages,
      });
    }

    return days;
  }, [messages]);

  const maxCost = Math.max(...dailyCosts.map(d => d.cost), 0.0001);
  const maxMessages = Math.max(...dailyCosts.map(d => d.messages), 1);

  // Model usage distribution
  const modelDistribution = useMemo(() => {
    const models = messages.reduce((acc, m) => {
      const model = m.model_used || 'unknown';
      acc[model] = (acc[model] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(models)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([model, count]) => ({
        model,
        count,
        percentage: ((count as number) / messages.length) * 100,
      }));
  }, [messages]);

  const maxModelCount = Math.max(...modelDistribution.map(m => m.count), 1);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Daily Costs Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Costs (Last 7 Days)</CardTitle>
          <CardDescription>Cost trends over the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dailyCosts.map((day, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{day.date}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{day.messages} msgs</span>
                    <span className="font-medium">${day.cost.toFixed(4)}</span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${(day.cost / maxCost) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Model Usage Distribution</CardTitle>
          <CardDescription>Top 5 most used models</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {modelDistribution.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate text-muted-foreground max-w-[200px]">{item.model}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${(item.count / maxModelCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Total Statistics */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
          <CardDescription>Overview of key metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Messages</p>
              <p className="text-2xl font-bold">{messages.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Cost/Message</p>
              <p className="text-2xl font-bold">
                ${messages.length > 0
                  ? (messages.reduce((sum, m) => sum + parseFloat(m.cost_usd || '0'), 0) / messages.length).toFixed(5)
                  : '0.00000'
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Tokens</p>
              <p className="text-2xl font-bold">
                {(messages.reduce((sum, m) => sum + (m.tokens || 0), 0) / 1_000_000).toFixed(2)}M
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unique Models</p>
              <p className="text-2xl font-bold">
                {new Set(messages.map(m => m.model_used || 'unknown')).size}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
