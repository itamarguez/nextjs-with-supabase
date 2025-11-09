// Session End Tracking API
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, duration, exitPage } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session ID' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Update session with end time and duration
    await supabase
      .from('sessions')
      .update({
        ended_at: new Date().toISOString(),
        duration_ms: duration,
        exit_page: exitPage,
        updated_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session end tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 }
    );
  }
}
