import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Supabase env vars are not set.');
    _supabase = createClient(url, key);
  }
  return _supabase;
}

// Convenience proxy — works the same as before in client components
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as any)[prop];
  },
});

export type Chat = {
  id: string;
  name: string | null;
  last_message: string | null;
  updated_at: string;
};

export type Message = {
  id: string;
  chat_id: string;
  sender: 'customer' | 'business';
  body: string;
  created_at: string;
};
