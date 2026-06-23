'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Auth from '@/components/Auth';
import Dashboard from './dashboard';

/**
 * Root page component with authentication protection
 * Redirects unauthenticated users to login, shows dashboard to authenticated users
 */
export default function Home() {
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Monitor auth state on mount
  useEffect(() => {
    try {
      // Check if user is already signed in
      supabase.auth
        .getSession()
        .then(({ data: { session } }) => {
          if (session?.user) {
            setIsSignedIn(true);
          } else {
            setIsSignedIn(false);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Error checking session:', err);
          setError('Failed to load authentication');
          setIsLoading(false);
        });

      // Subscribe to auth state changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          setIsSignedIn(true);
        } else {
          setIsSignedIn(false);
        }
        setError(null);
      });

      return () => subscription?.unsubscribe();
    } catch (err) {
      console.error('Auth setup error:', err);
      setError('Failed to initialize authentication');
      setIsLoading(false);
    }
  }, []);

  const handleSignedIn = () => {
    setIsSignedIn(true);
    setError(null);
  };

  const handleSignedOut = () => {
    setIsSignedIn(false);
  };

  // Show loading state while checking auth (max 3 seconds before showing auth form)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-sm text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state if needed, but allow user to continue to auth
  if (error && !isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 mb-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
          <Auth onSignedIn={handleSignedIn} onSignedOut={handleSignedOut} />
        </div>
      </div>
    );
  }

  // Show auth component if not signed in
  if (!isSignedIn) {
    return <Auth onSignedIn={handleSignedIn} onSignedOut={handleSignedOut} />;
  }

  // Show dashboard if signed in
  return <Dashboard />;
}
