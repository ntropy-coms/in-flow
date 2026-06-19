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
  whatsapp_number text,
  whatsapp_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Verification codes for WhatsApp linking
create table verification_codes (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  whatsapp_number text not null,
  code text not null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  verified boolean default false
);

-- Recommended RLS policies (examples) -------------------------------------
-- NOTE: service role bypasses RLS. The service key should be used from server
-- functions to perform sensitive operations (marking codes verified, updating
-- whatsapp_verified). The policies below are examples you can adapt and run
-- in the Supabase SQL editor.

-- 1) Add an owner to businesses (optional) and restrict updates to the owner:
-- alter table businesses add column owner_id uuid;
-- create policy "Businesses - owner can update" on businesses
--   for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- 2) Allow verified flag only to be changed by server (use service role):
-- create policy "Verification codes - insert by authenticated" on verification_codes
--   for insert using (auth.role() = 'authenticated');
-- -- NOTE: to restrict updates/inserts to only server, rely on service role
-- -- key (bypass RLS) and avoid exposing endpoints for these operations to
-- -- browser clients.

-- 3) Limit selects on verification_codes to the business owner:
-- create policy "Select verification codes for owner" on verification_codes
--   for select using (
--     (exists (select 1 from businesses b where b.id = business_id and b.owner_id = auth.uid()))
--   );

-- 4) Example: deny anonymous inserts into businesses (require auth)
-- alter table businesses enable row level security;
-- create policy "Allow insert for authenticated" on businesses
--   for insert using (auth.role() = 'authenticated');

-- Adjust and apply these policies according to your auth model.

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
