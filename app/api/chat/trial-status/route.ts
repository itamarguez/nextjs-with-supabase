// Check trial chat status (how many messages remaining)
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'edge';

const MAX_FREE_MESSAGES = 3;
const COOKIE_NAME = 'nomorefomo_trial_count';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const trialCountCookie = cookieStore.get(COOKIE_NAME);
    const currentCount = trialCountCookie ? parseInt(trialCountCookie.value, 10) : 0;

    const messagesRemaining = Math.max(0, MAX_FREE_MESSAGES - currentCount);
    const limitReached = currentCount >= MAX_FREE_MESSAGES;

    return NextResponse.json({
      messagesRemaining,
      messagesUsed: currentCount,
      limitReached,
    });
  } catch (error) {
    console.error('Trial status error:', error);
    return NextResponse.json(
      { error: 'Failed to check trial status' },
      { status: 500 }
    );
  }
}
