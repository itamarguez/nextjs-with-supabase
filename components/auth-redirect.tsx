'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * Client-side auth redirect for Safari compatibility
 * Safari's ITP can interfere with server-side auth detection
 */
export function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        router.push('/chat');
      }
    };

    checkAuth();
  }, [router]);

  return null;
}
