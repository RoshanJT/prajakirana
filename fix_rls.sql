-- FIX RLS POLICIES
-- Run this script in the Supabase SQL Editor to fix the "violates row-level security policy" error.

-- 1. Reset Donors Policy
DROP POLICY IF EXISTS "Staff can manage donors" ON public.donors;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.donors;

CREATE POLICY "Enable all access for authenticated users"
ON public.donors
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 2. Reset Campaigns Policy
DROP POLICY IF EXISTS "Staff can manage campaigns." ON public.campaigns;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.campaigns;

CREATE POLICY "Enable all access for authenticated users"
ON public.campaigns
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Reset Donations Policy
DROP POLICY IF EXISTS "Staff can manage donations" ON public.donations;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.donations;

CREATE POLICY "Enable all access for authenticated users"
ON public.donations
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Ensure Public Read Access (Optional, for website display)
CREATE POLICY "Public can view campaigns"
ON public.campaigns
FOR SELECT
TO public
USING (true);
