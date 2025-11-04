// One-time fix to create missing user profile
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (existingProfile) {
      return NextResponse.json({
        success: true,
        message: 'Profile already exists',
      });
    }

    // Create new profile with default values
    const { error: insertError } = await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        tier: 'free',
        tokens_used_this_month: 0,
        total_tokens_used: 0,
        total_cost_usd: 0,
        suspicious_activity_count: 0,
        is_suspended: false,
        premium_requests_this_month: 0,
      });

    if (insertError) {
      console.error('Error creating profile:', insertError);
      return NextResponse.json(
        { error: 'Failed to create profile', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile created successfully! You can now use the chat.',
      userId: user.id,
    });
  } catch (error: any) {
    console.error('Error in fix-profile:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
