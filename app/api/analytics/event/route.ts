// Conversion Event Tracking API
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, eventName, eventCategory, pagePath, metadata } = body;

    if (!sessionId || !eventName || !eventCategory) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Record conversion event
    await supabase.from('conversion_events').insert({
      user_id: user?.id || null,
      session_id: sessionId,
      event_name: eventName,
      event_category: eventCategory,
      page_path: pagePath,
      metadata: metadata || {},
    });

    // Update session based on event type
    if (eventName === 'signup_completed') {
      await supabase
        .from('sessions')
        .update({ did_sign_up: true, user_id: user?.id })
        .eq('session_id', sessionId);
    } else if (eventName === 'first_message_sent' || eventName === 'trial_message_sent') {
      // First get the current session to increment messages_sent
      const { data: session } = await supabase
        .from('sessions')
        .select('messages_sent')
        .eq('session_id', sessionId)
        .single();

      await supabase
        .from('sessions')
        .update({
          did_send_message: true,
          messages_sent: (session?.messages_sent || 0) + 1,
        })
        .eq('session_id', sessionId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Event tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}
