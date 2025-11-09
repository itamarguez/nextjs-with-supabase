// Page View Tracking API
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getClientIP } from '@/lib/ip-rate-limiter';
import { parseUserAgent, getCountryFromIP } from '@/lib/analytics/device-detector';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, pagePath, pageTitle, referrer, isFirstVisit, timeOnPreviousPage } = body;

    if (!sessionId || !pagePath) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get request metadata
    const clientIP = getClientIP(req);
    const userAgent = req.headers.get('user-agent');
    const deviceInfo = parseUserAgent(userAgent);
    const countryCode = await getCountryFromIP(clientIP);

    // Record page view
    await supabase.from('page_views').insert({
      user_id: user?.id || null,
      session_id: sessionId,
      page_path: pagePath,
      page_title: pageTitle,
      referrer,
      is_first_visit: isFirstVisit,
      time_on_page_ms: timeOnPreviousPage,
      ip_address: clientIP,
      user_agent: userAgent,
      device_type: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      country_code: countryCode,
    });

    // Update or create session
    const { data: existingSession } = await supabase
      .from('sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (existingSession) {
      // Update existing session
      await supabase
        .from('sessions')
        .update({
          page_views_count: (existingSession.page_views_count || 0) + 1,
          exit_page: pagePath,
          user_id: user?.id || existingSession.user_id, // Update if user logged in mid-session
          updated_at: new Date().toISOString(),
        })
        .eq('session_id', sessionId);
    } else {
      // Create new session
      await supabase.from('sessions').insert({
        user_id: user?.id || null,
        session_id: sessionId,
        entry_page: pagePath,
        exit_page: pagePath,
        page_views_count: 1,
        is_trial_user: !user,
        ip_address: clientIP,
        user_agent: userAgent,
        device_type: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        country_code: countryCode,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Page view tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track page view' },
      { status: 500 }
    );
  }
}
