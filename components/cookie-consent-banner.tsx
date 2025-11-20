'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

const COOKIE_CONSENT_NAME = 'nomorefomo_cookie_consent';
const CONSENT_EXPIRY_DAYS = 365;

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem(COOKIE_CONSENT_NAME);
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_NAME, 'accepted');
    setShowBanner(false);

    // Set cookie to track consent
    document.cookie = `${COOKIE_CONSENT_NAME}=accepted; max-age=${CONSENT_EXPIRY_DAYS * 24 * 60 * 60}; path=/; SameSite=Lax`;

    // Enable analytics if you add Google Analytics later
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'denied', // We don't use ads
      });
    }
  };

  const handleRejectAll = () => {
    localStorage.setItem(COOKIE_CONSENT_NAME, 'rejected');
    setShowBanner(false);

    // Set cookie to track rejection
    document.cookie = `${COOKIE_CONSENT_NAME}=rejected; max-age=${CONSENT_EXPIRY_DAYS * 24 * 60 * 60}; path=/; SameSite=Lax`;

    // Disable analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
      });
    }
  };

  const handleEssentialOnly = () => {
    localStorage.setItem(COOKIE_CONSENT_NAME, 'essential');
    setShowBanner(false);

    // Set cookie to track essential-only choice
    document.cookie = `${COOKIE_CONSENT_NAME}=essential; max-age=${CONSENT_EXPIRY_DAYS * 24 * 60 * 60}; path=/; SameSite=Lax`;

    // Disable analytics but keep essential cookies
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
      });
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom duration-500">
      <div className="mx-auto max-w-6xl">
        <div className="relative rounded-lg border bg-background/95 backdrop-blur-sm p-4 md:p-6 shadow-lg">
          <button
            onClick={handleEssentialOnly}
            className="absolute top-2 right-2 p-1 hover:bg-muted rounded-full transition-colors"
            aria-label="Close banner (essential cookies only)"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Cookie Icon & Text */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🍪</span>
                <h3 className="font-semibold text-lg">Cookie Preferences</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                We use cookies to improve your experience and analyze site usage. Essential cookies are required for the site to function.
                You can choose to accept all cookies or only essential ones.
                {' '}
                <Link
                  href="/privacy-policy"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Privacy Policy
                </Link>
                {' • '}
                <Link
                  href="/cookie-policy"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Cookie Policy
                </Link>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleEssentialOnly}
                className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-muted transition-colors whitespace-nowrap"
              >
                Essential Only
              </button>
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-muted transition-colors whitespace-nowrap"
              >
                Reject All
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                Accept All
              </button>
            </div>
          </div>

          {/* Cookie Types Breakdown */}
          <div className="mt-4 pt-4 border-t border-border">
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium hover:text-primary flex items-center gap-2">
                <span className="group-open:rotate-90 transition-transform">▶</span>
                What cookies do we use?
              </summary>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground pl-6">
                <div>
                  <strong className="text-foreground">Essential Cookies:</strong> Required for authentication, trial message tracking, and security. These cannot be disabled.
                </div>
                <div>
                  <strong className="text-foreground">Analytics Cookies (Optional):</strong> Help us understand how visitors use the site to improve user experience. May be anonymized and shared with partners.
                </div>
                <div>
                  <strong className="text-foreground">Marketing Cookies (Future):</strong> Not yet implemented. When available, will show relevant ads. You can opt-out anytime.
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
