-- Migration: Add strategy_intake table for Strategy Builder intake form
-- Stores the quick intake data collected before the full 39-question questionnaire

BEGIN;

-- ============================================================================
-- ENUM: business_stage
-- ============================================================================

CREATE TYPE business_stage AS ENUM ('idea', 'mvp_early', 'revenue_generating');

-- ============================================================================
-- ENUM: intake_status
-- ============================================================================

CREATE TYPE intake_status AS ENUM ('draft', 'in_progress', 'completed');

-- ============================================================================
-- TABLE: strategy_intake
-- ============================================================================

CREATE TABLE public.strategy_intake (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  -- Business info
  business_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  custom_industry TEXT,            -- populated when industry = 'other'

  -- Stage & context
  business_stage business_stage NOT NULL,
  main_challenge TEXT NOT NULL,
  primary_goal TEXT NOT NULL,

  -- Progress tracking
  status intake_status NOT NULL DEFAULT 'draft',
  current_step INT NOT NULL DEFAULT 1,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Composite index for efficient draft lookups per user
CREATE INDEX idx_strategy_intake_user_status ON public.strategy_intake(user_id, status);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.strategy_intake ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own strategy intakes"
  ON public.strategy_intake
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own strategy intakes"
  ON public.strategy_intake
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own strategy intakes"
  ON public.strategy_intake
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own strategy intakes"
  ON public.strategy_intake
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGER: auto-update updated_at
-- ============================================================================

CREATE TRIGGER update_strategy_intake_updated_at
  BEFORE UPDATE ON public.strategy_intake
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

COMMIT;
