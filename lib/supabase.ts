import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getSupabase() {
  return supabase;
}

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
