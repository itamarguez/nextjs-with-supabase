// Admin Dashboard - Monitor costs and usage (ADMIN ONLY)

import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // TODO: Add proper admin role check
  // For now, we'll just show the dashboard to any authenticated user
  // In production, check if user.email matches your admin email or has admin role

  // Fetch analytics data
  const { data: allProfiles } = await supabase
    .from('user_profiles')
    .select('*')
    .order('total_cost_usd', { ascending: false });

  const { data: recentMessages } = await supabase
    .from('messages')
    .select('*, conversations(user_id)')
    .eq('role', 'assistant')
    .order('created_at', { ascending: false })
    .limit(100);

  // Calculate total metrics
  const totalCost = allProfiles?.reduce((sum, p) => sum + parseFloat(p.total_cost_usd || '0'), 0) || 0;
  const totalTokens = allProfiles?.reduce((sum, p) => sum + (p.total_tokens_used || 0), 0) || 0;
  const totalUsers = allProfiles?.length || 0;

  // Count users by tier
  const tierCounts = allProfiles?.reduce((acc, p) => {
    acc[p.tier] = (acc[p.tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Calculate costs by model
  const modelCosts = recentMessages?.reduce((acc, m) => {
    const model = m.model_used || 'unknown';
    acc[model] = (acc[model] || 0) + parseFloat(m.cost_usd || '0');
    return acc;
  }, {} as Record<string, number>) || {};

  // Top users by cost
  const topUsers = allProfiles?.slice(0, 10) || [];

  // Abuse logs
  const { data: abuseLogCount } = await supabase
    .from('abuse_logs')
    .select('*', { count: 'exact', head: true });

  const { data: suspendedCount } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_suspended', true);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor costs, usage, and system health</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Cost</CardDescription>
            <CardTitle className="text-3xl">${totalCost.toFixed(4)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Lifetime platform costs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Tokens</CardDescription>
            <CardTitle className="text-3xl">{(totalTokens / 1_000_000).toFixed(2)}M</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">All-time token usage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-3xl">{totalUsers}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Free: {tierCounts['free'] || 0} | Pro: {tierCounts['pro'] || 0} | Unlimited: {tierCounts['unlimited'] || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Abuse Incidents</CardDescription>
            <CardTitle className="text-3xl">{abuseLogCount || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {suspendedCount || 0} users suspended
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Model Costs */}
      <Card>
        <CardHeader>
          <CardTitle>Costs by Model</CardTitle>
          <CardDescription>Recent model usage and costs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(modelCosts)
              .sort(([, a], [, b]) => b - a)
              .map(([model, cost]) => (
                <div key={model} className="flex justify-between items-center">
                  <span className="font-medium">{model}</span>
                  <Badge variant="secondary">${cost.toFixed(4)}</Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Users by Cost */}
      <Card>
        <CardHeader>
          <CardTitle>Top Users by Cost</CardTitle>
          <CardDescription>Users with highest lifetime costs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topUsers.map((profile, index) => (
              <div key={profile.id} className="flex justify-between items-center border-b pb-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                  <div>
                    <p className="font-medium">{profile.id.substring(0, 8)}...</p>
                    <p className="text-xs text-muted-foreground">
                      {profile.total_tokens_used.toLocaleString()} tokens
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge>{profile.tier}</Badge>
                  <p className="text-sm font-medium mt-1">${parseFloat(profile.total_cost_usd).toFixed(4)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
