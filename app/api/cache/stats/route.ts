// Cache Statistics API
// Returns cache hit/miss rates and cost savings analytics

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { promptCache } from '@/lib/cache/prompt-cache';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin check
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail || user.email !== adminEmail) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // Get cache statistics
    const stats = promptCache.getStats();

    // Calculate cost savings (estimate based on average token count)
    // Assuming average of 1000 tokens per cached request at $0.002 per 1K tokens
    const avgCostPerRequest = 0.002; // Rough estimate
    const estimatedSavings = stats.hits * avgCostPerRequest;

    return NextResponse.json({
      ...stats,
      estimatedSavings: parseFloat(estimatedSavings.toFixed(4)),
    });
  } catch (error) {
    console.error('Cache stats API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
