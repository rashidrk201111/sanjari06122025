-- Supabase SQL Patch: Enable Guest / Anonymous Checkout Order Insertion
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/hgxhdmcqrcsjsxuaeyrl/sql/new)

-- Step 1: Drop the existing restrictively scoped insert policy for orders
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;

-- Step 2: Create a new, modern insertion policy that:
--   a) Allows authenticated users to create orders for themselves (where user_id matches their UUID).
--   b) Allows unauthenticated guests to create orders (where user_id is NULL).
CREATE POLICY "orders_insert_policy" ON public.orders
    FOR INSERT 
    WITH CHECK (
        (auth.role() = 'authenticated' AND auth.uid()::text = user_id::text)
        OR 
        (user_id IS NULL)
    );

-- Step 3: Verify policies are active
-- SELECT policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'orders';
