'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TIER_PRICING } from '@/lib/llm/models';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function UpgradePage() {
  const [currentTier, setCurrentTier] = useState<string>('free');
  const [loading, setLoading] = useState(true);
  const [upgradingTo, setUpgradingTo] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadUserTier() {
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
        setCurrentTier(profile.tier);
      }

      setLoading(false);
    }

    loadUserTier();
  }, [supabase, router]);

  const handleUpgrade = async (tier: 'pro' | 'unlimited') => {
    setUpgradingTo(tier);

    try {
      // Get the price ID from environment
      const priceId =
        tier === 'pro'
          ? process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_1SSy2BDWrydnj4h1XV6SsJ8G'
          : process.env.NEXT_PUBLIC_STRIPE_UNLIMITED_PRICE_ID || 'price_1SSy6ZDWrydnj4h1iqyMH3gF';

      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, tier }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Failed to start upgrade process. Please try again.');
      setUpgradingTo(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get access to the best AI models and unlock your full potential
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Current plan: <span className="font-semibold capitalize">{currentTier}</span>
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Free Tier */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 relative">
            {currentTier === 'free' && (
              <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                Current Plan
              </div>
            )}
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{TIER_PRICING.free.name}</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold text-gray-900">${TIER_PRICING.free.price}</span>
              <span className="text-gray-600">/month</span>
            </div>
            <p className="text-gray-600 mb-6">{TIER_PRICING.free.monthlyTokens}</p>
            <ul className="space-y-3 mb-8">
              {TIER_PRICING.free.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            {currentTier === 'free' ? (
              <button disabled className="w-full py-3 px-6 rounded-lg bg-gray-200 text-gray-500 font-semibold cursor-not-allowed">
                Your Current Plan
              </button>
            ) : (
              <button disabled className="w-full py-3 px-6 rounded-lg bg-gray-200 text-gray-500 font-semibold cursor-not-allowed">
                Not Available
              </button>
            )}
          </div>

          {/* Pro Tier */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-4 border-blue-500 relative transform md:scale-105">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-sm font-bold px-4 py-1 rounded-full">
              MOST POPULAR
            </div>
            {currentTier === 'pro' && (
              <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                Current Plan
              </div>
            )}
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{TIER_PRICING.pro.name}</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold text-gray-900">${TIER_PRICING.pro.price}</span>
              <span className="text-gray-600">/month</span>
            </div>
            <p className="text-gray-600 mb-6">{TIER_PRICING.pro.monthlyTokens}</p>
            <ul className="space-y-3 mb-8">
              {TIER_PRICING.pro.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            {currentTier === 'pro' ? (
              <button disabled className="w-full py-3 px-6 rounded-lg bg-gray-200 text-gray-500 font-semibold cursor-not-allowed">
                Your Current Plan
              </button>
            ) : (
              <button
                onClick={() => handleUpgrade('pro')}
                disabled={upgradingTo !== null}
                className="w-full py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {upgradingTo === 'pro' ? 'Processing...' : 'Upgrade to Pro'}
              </button>
            )}
          </div>

          {/* Unlimited Tier */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-200 relative">
            {currentTier === 'unlimited' && (
              <div className="absolute top-4 right-4 bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                Current Plan
              </div>
            )}
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{TIER_PRICING.unlimited.name}</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold text-gray-900">${TIER_PRICING.unlimited.price}</span>
              <span className="text-gray-600">/month</span>
            </div>
            <p className="text-gray-600 mb-6">{TIER_PRICING.unlimited.monthlyTokens}</p>
            <ul className="space-y-3 mb-8">
              {TIER_PRICING.unlimited.features.map((feature, idx) => (
                <li key={idx} className="flex items-start">
                  <svg className="w-5 h-5 text-purple-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            {currentTier === 'unlimited' ? (
              <button disabled className="w-full py-3 px-6 rounded-lg bg-gray-200 text-gray-500 font-semibold cursor-not-allowed">
                Your Current Plan
              </button>
            ) : (
              <button
                onClick={() => handleUpgrade('unlimited')}
                disabled={upgradingTo !== null}
                className="w-full py-3 px-6 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {upgradingTo === 'unlimited' ? 'Processing...' : 'Upgrade to Unlimited'}
              </button>
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <details className="bg-white p-6 rounded-lg shadow">
              <summary className="font-semibold cursor-pointer">Can I cancel anytime?</summary>
              <p className="mt-2 text-gray-600">Yes! You can cancel your subscription at any time. Your access will continue until the end of your billing period.</p>
            </details>
            <details className="bg-white p-6 rounded-lg shadow">
              <summary className="font-semibold cursor-pointer">What payment methods do you accept?</summary>
              <p className="mt-2 text-gray-600">We accept all major credit cards and debit cards through Stripe.</p>
            </details>
            <details className="bg-white p-6 rounded-lg shadow">
              <summary className="font-semibold cursor-pointer">What happens if I exceed my token limit?</summary>
              <p className="mt-2 text-gray-600">You'll be notified when you're approaching your limit. Once reached, you'll need to upgrade or wait until your monthly reset.</p>
            </details>
          </div>
        </div>

        {/* Back to Chat Button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => router.push('/chat')}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Back to Chat
          </button>
        </div>
      </div>
    </div>
  );
}
