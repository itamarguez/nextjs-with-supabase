'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Client-side auth redirect for Safari compatibility
 * Safari's ITP can interfere with server-side auth detection
 */
export function AuthRedirect() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();

        // Use getSession for more reliable client-side auth check
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // User is authenticated, redirect to chat
          router.replace('/chat');
        } else {
          // Not authenticated, stay on landing page
          setChecking(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setChecking(false);
      }
    };

    // Small delay to let browser settle (helps with Safari)
    const timer = setTimeout(checkAuth, 100);

    return () => clearTimeout(timer);
  }, [router]);

  // Don't show anything while checking (prevents flash)
  if (checking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return null;
}
