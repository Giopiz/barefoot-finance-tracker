create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  budget_framework text not null default 'barefoot',
  monthly_income numeric(12, 2) not null default 0.00,
  current_streak integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.buckets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null,
  balance numeric(12, 2) not null default 0.00,
  target_percentage integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  bucket_id uuid references public.buckets(id) on delete set null,
  amount numeric(12, 2) not null,
  type text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_buckets_user_id on public.buckets(user_id);
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_bucket_id on public.transactions(bucket_id);
create index if not exists idx_transactions_created_at on public.transactions(created_at desc);

alter table public.profiles enable row level security;
alter table public.buckets enable row level security;
alter table public.transactions enable row level security;

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users can view own buckets" on public.buckets for select using (auth.uid() = user_id);
create policy "Users can insert own buckets" on public.buckets for insert with check (auth.uid() = user_id);
create policy "Users can update own buckets" on public.buckets for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own buckets" on public.buckets for delete using (auth.uid() = user_id);

create policy "Users can view own transactions" on public.transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions" on public.transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions" on public.transactions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own transactions" on public.transactions for delete using (auth.uid() = user_id);
