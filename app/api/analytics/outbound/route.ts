// Outbound Click Tracking API
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getClientIP } from '@/lib/ip-rate-limiter';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, linkUrl, linkText, pagePath } = body;

    if (!sessionId || !linkUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const clientIP = getClientIP(req);

    // Record outbound click
    await supabase.from('outbound_clicks').insert({
      user_id: user?.id || null,
      session_id: sessionId,
      link_url: linkUrl,
      link_text: linkText,
      page_path: pagePath,
      ip_address: clientIP,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Outbound click tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track outbound click' },
      { status: 500 }
    );
  }
}
