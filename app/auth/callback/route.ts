// OAuth callback handler
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const cookieStore = await cookies();

    // Create response first
    const response = NextResponse.redirect(`${origin}/chat`);

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
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    // Exchange code for session - this will call setAll() and add cookies to response
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if user profile exists, create if not
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (!profile) {
        // Create profile for new OAuth user
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
      }

      // Return response with cookies set
      return response;
    }
  }

  // If error, redirect to login
  return NextResponse.redirect(`${origin}/auth/login`);
}
