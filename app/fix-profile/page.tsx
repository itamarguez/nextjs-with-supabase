'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FixProfilePage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function fixProfile() {
    setStatus('loading');
    setMessage('Creating your profile...');

    try {
      const response = await fetch('/api/fix-profile', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Profile created successfully!');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to create profile');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'An error occurred');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Fix Your Profile</CardTitle>
          <CardDescription>
            Create your user profile to start using NoMoreFOMO
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'idle' && (
            <Button onClick={fixProfile} className="w-full">
              Create Profile
            </Button>
          )}

          {status === 'loading' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                <p className="font-medium">✅ {message}</p>
              </div>
              <Button onClick={() => window.location.href = '/chat'} className="w-full">
                Go to Chat
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                <p className="font-medium">❌ {message}</p>
              </div>
              <Button onClick={fixProfile} variant="outline" className="w-full">
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
