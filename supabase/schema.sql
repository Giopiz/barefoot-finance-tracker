-- ==============================================================================
-- PERSONAL FINANCE MICRO-SAAS: SUPABASE SQL SCHEMA & DEFENSIVE SECURITY
-- ==============================================================================

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  budget_framework text not null default 'barefoot',
  monthly_income numeric(12, 2) not null default 0.00,
  current_streak integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Defensive Constraints
  constraint check_monthly_income_non_negative check (monthly_income >= 0),
  constraint check_streak_non_negative check (current_streak >= 0),
  constraint check_budget_framework_valid check (budget_framework in ('barefoot', '50-30-20', 'custom'))
);

-- 2. BUCKETS TABLE
create table if not exists public.buckets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null,
  balance numeric(12, 2) not null default 0.00,
  target_percentage integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Defensive Constraints
  constraint check_target_percentage_range check (target_percentage between 0 and 100),
  constraint check_bucket_type_valid check (type in ('splurge', 'bill', 'savings', 'goal')),
  constraint check_reasonable_balance check (balance >= -1000000 and balance <= 100000000)
);

-- 3. TRANSACTIONS TABLE
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  bucket_id uuid references public.buckets(id) on delete set null,
  amount numeric(12, 2) not null,
  type text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Defensive Constraints
  constraint check_transaction_amount_positive check (amount > 0 and amount <= 10000000),
  constraint check_transaction_type_valid check (type in ('splurge', 'bill', 'expense', 'income', 'transfer'))
);

-- ==============================================================================
-- DATABASE INDEXES (Performance & Tenant Isolation Optimization)
-- ==============================================================================
create index if not exists idx_buckets_user_id on public.buckets(user_id);
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_bucket_id on public.transactions(bucket_id);
create index if not exists idx_transactions_created_at on public.transactions(created_at desc);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Complete tenant isolation: auth.uid() strictly enforced on all CRUD operations
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.buckets enable row level security;
alter table public.transactions enable row level security;

-- PROFILES POLICIES
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- BUCKETS POLICIES
create policy "Users can view own buckets"
  on public.buckets for select
  using (auth.uid() = user_id);

create policy "Users can insert own buckets"
  on public.buckets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own buckets"
  on public.buckets for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own buckets"
  on public.buckets for delete
  using (auth.uid() = user_id);

-- TRANSACTIONS POLICIES
create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- ==============================================================================
-- SECURE TRIGGER: AUTOMATIC PROFILE & STARTER BUCKETS ON USER SIGNUP
-- Hardened with `security definer set search_path = public` to prevent privilege escalation
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, budget_framework, monthly_income, current_streak)
  values (new.id, 'barefoot', 0, 1)
  on conflict (id) do nothing;

  insert into public.buckets (user_id, name, type, balance, target_percentage)
  values
    (new.id, 'Daily Expenses', 'bill', 0, 60),
    (new.id, 'Fire Extinguisher', 'savings', 0, 20),
    (new.id, 'Splurge', 'splurge', 0, 10),
    (new.id, 'Smile', 'goal', 0, 10)
  on conflict do nothing;

  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
