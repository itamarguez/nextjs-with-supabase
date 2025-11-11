// Cache Statistics Card - Shows prompt cache performance metrics
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from 'lucide-react';

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  hitRate: number;
  totalRequests: number;
  estimatedSavings: number;
  uptime: number;
}

export function CacheStatsCard() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/cache/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch cache stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardDescription>Prompt Cache Performance</CardDescription>
            <Database className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-3xl">Loading...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardDescription>Prompt Cache Performance</CardDescription>
            <Database className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-3xl text-destructive">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">{error || 'Failed to load'}</p>
        </CardContent>
      </Card>
    );
  }

  const hitRatePercent = (stats.hitRate * 100).toFixed(1);
  const uptimeHours = (stats.uptime / 3600).toFixed(1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardDescription>Prompt Cache Performance</CardDescription>
          <Database className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardTitle className="text-3xl">{hitRatePercent}%</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">
          Cache Hit Rate
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Hits</p>
            <p className="font-semibold">{stats.hits.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Misses</p>
            <p className="font-semibold">{stats.misses.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Cache Size</p>
            <p className="font-semibold">{stats.size} entries</p>
          </div>
          <div>
            <p className="text-muted-foreground">Est. Savings</p>
            <p className="font-semibold text-green-600">${stats.estimatedSavings.toFixed(2)}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            Uptime: {uptimeHours}h | Total: {stats.totalRequests.toLocaleString()} requests
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
