// Page View Tracker - Client Component for Analytics
// Automatically tracks page views when mounted

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView, endSession } from '@/lib/analytics/tracker';

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view on mount and pathname change
    trackPageView(pathname);

    // Track session end on page unload
    const handleUnload = () => {
      endSession();
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [pathname]);

  return null; // This component doesn't render anything
}
