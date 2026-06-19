import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const client: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const supabase = client ?? ({} as SupabaseClient);

export function getSupabase() {
  if (!client) {
    throw new Error('Supabase environment variables are required to initialize the client.');
  }
  return client;
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

export type Business = {
  id: string;
  business_name: string;
  categories: string[];
  address: string;
  email: string;
  whatsapp_number: string;
  created_at: string;
  updated_at: string;
};
