-- ============================================================================
-- ADMIN RLS POLICIES
-- Allows users with role='admin' to manage all user data
-- ============================================================================

-- Helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- USER PROFILES — admin can SELECT, UPDATE, DELETE all
-- ============================================================================
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all profiles" ON public.user_profiles
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete profiles" ON public.user_profiles
  FOR DELETE USING (public.is_admin());

-- ============================================================================
-- SUBSCRIPTIONS — admin can SELECT, UPDATE all
-- ============================================================================
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all subscriptions" ON public.subscriptions
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- USER ENTITLEMENTS — admin full access
-- ============================================================================
CREATE POLICY "Admins can view all entitlements" ON public.user_entitlements
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert entitlements" ON public.user_entitlements
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update all entitlements" ON public.user_entitlements
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete entitlements" ON public.user_entitlements
  FOR DELETE USING (public.is_admin());

-- ============================================================================
-- STRATEGY CREDITS — admin full access
-- ============================================================================
CREATE POLICY "Admins can view all credits" ON public.strategy_credits
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert credits" ON public.strategy_credits
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update all credits" ON public.strategy_credits
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================================
-- CREDIT TRANSACTIONS — admin can read all
-- ============================================================================
CREATE POLICY "Admins can view all credit transactions" ON public.credit_transactions
  FOR SELECT USING (public.is_admin());

-- ============================================================================
-- PURCHASES — admin can read all
-- ============================================================================
CREATE POLICY "Admins can view all purchases" ON public.purchases
  FOR SELECT USING (public.is_admin());
