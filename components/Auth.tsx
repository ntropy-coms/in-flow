'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface AuthProps {
  onSignedIn: () => void;
}

export default function Auth({ onSignedIn }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token) onSignedIn();
    });
    return () => sub.subscription.unsubscribe();
  }, [onSignedIn]);

  async function handleSignUp() {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else onSignedIn();
  }

  async function handleSignIn() {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else onSignedIn();
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#09090f] px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-[#2a2a3a] bg-[#111118] p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Sign in or create account</h2>
        <p className="text-sm text-[#9090a8] mb-4">Use an email and password to manage your business.</p>
        <label className="block text-sm text-[#e8e8f0] mb-2">
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 rounded-lg px-3 py-2 bg-[#15151d] text-white outline-none" />
        </label>
        <label className="block text-sm text-[#e8e8f0] mb-4">
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mt-1 rounded-lg px-3 py-2 bg-[#15151d] text-white outline-none" />
        </label>
        {error && <p className="text-sm text-[#ff6b6b] mb-2">{error}</p>}
        <div className="flex gap-2">
          <button onClick={handleSignIn} disabled={loading} className="flex-1 rounded-2xl bg-[#6c63ff] px-4 py-2 text-white">Sign in</button>
          <button onClick={handleSignUp} disabled={loading} className="flex-1 rounded-2xl border border-[#2a2a3a] px-4 py-2 text-white">Create</button>
        </div>
      </div>
    </div>
  );
}
