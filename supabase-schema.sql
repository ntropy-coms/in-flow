-- Run this inside your Supabase SQL editor

-- 1. Create Chats Table
create table chats (
  id text primary key, -- customer phone number
  name text,
  last_message text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1.1 Create Businesses Table
create table businesses (
  id uuid default gen_random_uuid() primary key,
  business_name text not null,
  categories text[] not null,
  address text not null,
  email text not null,
  whatsapp_number text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Messages Table
create table messages (
  id uuid default gen_random_uuid() primary key,
  chat_id text references chats(id) on delete cascade,
  sender text not null check (sender in ('customer', 'business')),
  body text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Real-time for both tables
alter publication supabase_realtime add table chats;
alter publication supabase_realtime add table messages;

-- 4. Indexes for performance
create index messages_chat_id_idx on messages(chat_id);
create index messages_created_at_idx on messages(created_at);
create index chats_updated_at_idx on chats(updated_at desc);
