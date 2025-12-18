-- Create profiles table
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  full_name text,
  role text default 'staff',
  primary key (id)
);

-- Create donors table
create table public.donors (
  id uuid not null default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  address text,
  created_at timestamptz default now(),
  primary key (id)
);

-- Create campaigns table
create table public.campaigns (
  id uuid not null default gen_random_uuid(),
  title text not null,
  description text,
  goal_amount numeric not null,
  raised_amount numeric default 0,
  status text default 'active',
  created_at timestamptz default now(),
  primary key (id)
);

-- Create donations table
create table public.donations (
  id uuid not null default gen_random_uuid(),
  donor_id uuid references public.donors on delete set null,
  campaign_id uuid references public.campaigns on delete set null,
  amount numeric not null,
  payment_method text,
  date timestamptz default now(),
  primary key (id)
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.donors enable row level security;
alter table public.campaigns enable row level security;
alter table public.donations enable row level security;

-- Create policies
-- Allow public read access to campaigns (e.g., for website display)
create policy "Public campaigns are viewable by everyone."
  on campaigns for select
  using ( true );

-- Allow authenticated users (staff) to manage campaigns
create policy "Staff can manage campaigns."
  on campaigns for all
  using ( auth.role() = 'authenticated' );

-- Allow authenticated users to manage donors and donations
create policy "Staff can manage donors"
  on donors for all
  using ( auth.role() = 'authenticated' );

create policy "Staff can manage donations"
  on donations for all
  using ( auth.role() = 'authenticated' );

-- Profiles policies
create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Profiles are viewable by owner."
  on profiles for select
  using ( auth.uid() = id );

-- Function to handle new user creation automatically
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data ->> 'full_name', 'staff');
  return new;
end;
$$;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
