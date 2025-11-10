// Enhanced Admin Dashboard - Comprehensive Analytics & User Management
// ADMIN ONLY - Requires ADMIN_EMAIL environment variable

import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { redirect } from 'next/navigation';
import { UserManagementTable } from '@/components/admin/user-management-table';
import { AnalyticsCharts } from '@/components/admin/analytics-charts';
import { Users, DollarSign, TrendingUp, Activity } from 'lucide-react';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Admin role check
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.error('ADMIN_EMAIL environment variable not set');
    redirect('/chat');
  }

  if (user.email !== adminEmail) {
    console.warn(`Unauthorized admin access attempt by: ${user.email}`);
    redirect('/chat');
  }

  // ============================================
  // FETCH ANALYTICS DATA
  // ============================================

  // Time periods
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);

  // All user profiles
  const { data: allProfiles } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  // All messages for cost calculations
  const { data: allMessages } = await supabase
    .from('messages')
    .select('*')
    .eq('role', 'assistant')
    .order('created_at', { ascending: false });

  // ============================================
  // CALCULATE WAU/MAU/DAU
  // ============================================

  // Get unique users from sessions table
  const { data: todaySessions } = await supabase
    .from('sessions')
    .select('user_id')
    .gte('started_at', today.toISOString())
    .not('user_id', 'is', null);

  const { data: weekSessions } = await supabase
    .from('sessions')
    .select('user_id')
    .gte('started_at', weekAgo.toISOString())
    .not('user_id', 'is', null);

  const { data: monthSessions } = await supabase
    .from('sessions')
    .select('user_id')
    .gte('started_at', monthAgo.toISOString())
    .not('user_id', 'is', null);

  const dau = new Set(todaySessions?.map(s => s.user_id) || []).size;
  const wau = new Set(weekSessions?.map(s => s.user_id) || []).size;
  const mau = new Set(monthSessions?.map(s => s.user_id) || []).size;

  // ============================================
  // CALCULATE COSTS & REVENUE
  // ============================================

  const totalCost = allProfiles?.reduce((sum, p) => sum + parseFloat(p.total_cost_usd || '0'), 0) || 0;
  const totalTokens = allProfiles?.reduce((sum, p) => sum + (p.total_tokens_used || 0), 0) || 0;

  // Revenue calculations (simplified - assume tier pricing)
  const tierRevenue = {
    free: 0,
    pro: (allProfiles?.filter(p => p.tier === 'pro').length || 0) * 12, // $12/month
    unlimited: (allProfiles?.filter(p => p.tier === 'unlimited').length || 0) * 49, // $49/month
  };
  const monthlyRevenue = tierRevenue.pro + tierRevenue.unlimited;
  const profitMargin = monthlyRevenue - totalCost;

  // Count users by tier
  const tierCounts = allProfiles?.reduce((acc, p) => {
    acc[p.tier] = (acc[p.tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // ============================================
  // COST BREAKDOWN BY MODEL & TIME PERIOD
  // ============================================

  const todayMessages = allMessages?.filter(m => new Date(m.created_at) >= today) || [];
  const weekMessages = allMessages?.filter(m => new Date(m.created_at) >= weekAgo) || [];
  const monthMessages = allMessages?.filter(m => new Date(m.created_at) >= monthAgo) || [];

  const calculateModelCosts = (messages: any[]) => {
    return messages.reduce((acc, m) => {
      const model = m.model_used || 'unknown';
      acc[model] = (acc[model] || 0) + parseFloat(m.cost_usd || '0');
      return acc;
    }, {} as Record<string, number>);
  };

  const todayCosts = calculateModelCosts(todayMessages);
  const weekCosts = calculateModelCosts(weekMessages);
  const monthCosts = calculateModelCosts(monthMessages);

  const todayTotalCost = Object.values(todayCosts).reduce((sum: number, cost) => sum + cost, 0);
  const weekTotalCost = Object.values(weekCosts).reduce((sum: number, cost) => sum + cost, 0);
  const monthTotalCost = Object.values(monthCosts).reduce((sum: number, cost) => sum + cost, 0);

  // ============================================
  // USER ACTIVITY & CONVERSION METRICS
  // ============================================

  // Trial conversions
  const { data: trialSessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('is_trial_user', true);

  const { data: convertedSessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('is_trial_user', true)
    .eq('did_sign_up', true);

  const conversionRate = trialSessions && trialSessions.length > 0
    ? ((convertedSessions?.length || 0) / trialSessions.length) * 100
    : 0;

  // ============================================
  // PREPARE USER DATA FOR TABLE
  // ============================================

  const usersWithStats = allProfiles?.map(profile => {
    const userMessages = allMessages?.filter(m => {
      // Messages are linked to conversations which have user_id
      // We need to get the user_id from the conversation
      return m.conversation_id; // We'll need to join this properly
    }) || [];

    return {
      ...profile,
      messagesCount: userMessages.length,
      lastActive: profile.updated_at,
    };
  }) || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive analytics and user management</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Admin Access
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Daily Active Users</CardDescription>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-3xl">{dau}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              WAU: {wau} | MAU: {mau}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Monthly Revenue</CardDescription>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-3xl">${monthlyRevenue}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Profit: ${profitMargin.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Total Users</CardDescription>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-3xl">{allProfiles?.length || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Free: {tierCounts['free'] || 0} | Pro: {tierCounts['pro'] || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Conversion Rate</CardDescription>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-3xl">{conversionRate.toFixed(1)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {convertedSessions?.length || 0} / {trialSessions?.length || 0} trials
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown by Time Period */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Today's Costs</CardTitle>
            <CardDescription>{todayMessages.length} messages</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${todayTotalCost.toFixed(4)}</p>
            <div className="mt-4 space-y-2">
              {Object.entries(todayCosts)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 3)
                .map(([model, cost]) => (
                  <div key={model} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate">{model}</span>
                    <span className="font-medium">${(cost as number).toFixed(4)}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Last 7 Days</CardTitle>
            <CardDescription>{weekMessages.length} messages</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${weekTotalCost.toFixed(4)}</p>
            <div className="mt-4 space-y-2">
              {Object.entries(weekCosts)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 3)
                .map(([model, cost]) => (
                  <div key={model} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate">{model}</span>
                    <span className="font-medium">${(cost as number).toFixed(4)}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Last 30 Days</CardTitle>
            <CardDescription>{monthMessages.length} messages</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${monthTotalCost.toFixed(4)}</p>
            <div className="mt-4 space-y-2">
              {Object.entries(monthCosts)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 3)
                .map(([model, cost]) => (
                  <div key={model} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate">{model}</span>
                    <span className="font-medium">${(cost as number).toFixed(4)}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <AnalyticsCharts
        messages={allMessages || []}
        sessions={weekSessions || []}
      />

      {/* User Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Search, filter, and manage all users</CardDescription>
        </CardHeader>
        <CardContent>
          <UserManagementTable users={usersWithStats} />
        </CardContent>
      </Card>
    </div>
  );
}
