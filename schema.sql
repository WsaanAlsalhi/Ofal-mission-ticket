-- Run once in Supabase > SQL Editor
create table if not exists rocket_participants (
  id bigint generated always as identity primary key,
  created_at timestamptz default now()
);
alter table rocket_participants add column if not exists name text;
alter table rocket_participants add column if not exists email text;
alter table rocket_participants add column if not exists team text;
alter table rocket_participants add column if not exists country text;
alter table rocket_participants add column if not exists mission_id text;
alter table rocket_participants add column if not exists seat text;

-- Only the server (service role key) touches this table
alter table rocket_participants enable row level security;
