'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic';

export default function UpgradeSuccessPage() {
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    async function checkUpgrade() {
      // Wait a moment for webhook to process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/sign-in');
        return;
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('tier')
        .eq('id', user.id)
        .single();

      if (profile) {
        setTier(profile.tier);
      }

      setLoading(false);
    }

    checkUpgrade();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-700">Processing your upgrade...</p>
          <p className="mt-2 text-sm text-gray-500">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to {tier === 'pro' ? 'Pro' : 'Unlimited'}!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Your subscription has been activated successfully. You now have access to all premium features!
        </p>

        {/* What's Next */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-3">What's included:</h3>
          <ul className="space-y-2 text-gray-700">
            {tier === 'pro' && (
              <>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  2M tokens per month
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Access to GPT-4o & Claude Sonnet
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Smart routing for best results
                </li>
              </>
            )}
            {tier === 'unlimited' && (
              <>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-purple-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  10M tokens per month
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-purple-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  All premium models unlocked
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-purple-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Priority support & processing
                </li>
              </>
            )}
          </ul>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => router.push('/chat')}
          className="w-full py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors mb-4"
        >
          Start Chatting with Premium Models
        </button>

        {/* Secondary Action */}
        <button
          onClick={() => router.push('/admin')}
          className="w-full py-2 px-6 rounded-lg text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          View Usage Dashboard
        </button>
      </div>
    </div>
  );
}
