-- Allow public read access to donors and donations for development
drop policy if exists "Staff can manage donors" on public.donors;
drop policy if exists "Staff can manage donations" on public.donations;

-- Re-create stricter policies for write access
create policy "Staff can manage donors"
  on public.donors
  for all
  using ( auth.role() = 'authenticated' );

create policy "Staff can manage donations"
  on public.donations
  for all
  using ( auth.role() = 'authenticated' );

-- Add PUBLIC READ policies
create policy "Enable public read access for donors"
  on public.donors
  for select
  using ( true );

create policy "Enable public read access for donations"
  on public.donations
  for select
  using ( true );
