// OAuth callback handler
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  console.log('[OAuth Callback] Starting callback, code:', code ? 'present' : 'missing');

  if (code) {
    const cookieStore = await cookies();

    // Create response first
    const response = NextResponse.redirect(`${origin}/chat`);
    console.log('[OAuth Callback] Response created, redirecting to:', `${origin}/chat`);

    // Create Supabase client with cookie handling that writes to response
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            // Set cookies on the response object, not just cookieStore
            console.log('[OAuth Callback] Setting cookies, count:', cookiesToSet.length);
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    // Exchange code for session - this will call setAll() and add cookies to response
    console.log('[OAuth Callback] Exchanging code for session...');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log('[OAuth Callback] Exchange result - error:', error ? error.message : 'none', 'user:', data?.user?.email || 'none');

    if (!error && data.user) {
      // Check if user profile exists, create if not
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (!profile) {
        // Create profile for new OAuth user
        console.log('[OAuth Callback] Creating new user profile for:', data.user.email);
        await supabase.from('user_profiles').insert({
          id: data.user.id,
          tier: 'free',
          tokens_used_this_month: 0,
          total_tokens_used: 0,
          total_cost_usd: 0,
          suspicious_activity_count: 0,
          is_suspended: false,
          premium_requests_this_month: 0,
        });
      } else {
        console.log('[OAuth Callback] User profile already exists');
      }

      // Return response with cookies set
      console.log('[OAuth Callback] SUCCESS - Returning redirect to /chat with cookies');
      return response;
    } else {
      console.log('[OAuth Callback] FAILED - No user data, redirecting to login');
    }
  } else {
    console.log('[OAuth Callback] No code parameter, redirecting to login');
  }

  // If error, redirect to login
  console.log('[OAuth Callback] Fallback - Redirecting to login');
  return NextResponse.redirect(`${origin}/auth/login`);
}
