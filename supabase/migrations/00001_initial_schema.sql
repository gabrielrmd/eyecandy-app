-- Advertising Unplugged - Complete Database Schema
-- PostgreSQL with Supabase Auth Integration

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE subscription_plan AS ENUM ('starter', 'professional', 'enterprise', 'template_toolkit', 'free');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'trialing', 'incomplete');
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');
CREATE TYPE challenge_status AS ENUM ('not_started', 'in_progress', 'completed', 'abandoned');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'canceled');

-- ============================================================================
-- USERS & PROFILES
-- ============================================================================

CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  company_website TEXT,
  industry TEXT,
  team_size INT,
  role_in_company TEXT,
  bio TEXT,
  avatar_url TEXT,
  country TEXT,
  timezone TEXT,
  phone TEXT,

  -- Platform preferences
  preferred_language TEXT DEFAULT 'en',
  notification_email_marketing BOOLEAN DEFAULT true,
  notification_ai_insights BOOLEAN DEFAULT true,
  notification_community_updates BOOLEAN DEFAULT true,

  -- Account metadata
  onboarding_completed BOOLEAN DEFAULT false,
  first_login_at TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  role user_role DEFAULT 'user'
);

CREATE INDEX idx_user_profiles_company ON public.user_profiles(company_name);
CREATE INDEX idx_user_profiles_industry ON public.user_profiles(industry);

-- ============================================================================
-- SUBSCRIPTIONS
-- ============================================================================

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  -- Stripe integration
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT,
  stripe_product_id TEXT,
  stripe_price_id TEXT,

  -- Plan details
  plan subscription_plan NOT NULL,
  status subscription_status NOT NULL DEFAULT 'active',

  -- Dates
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,

  -- Pricing
  monthly_amount_cents INT, -- stored in cents
  currency TEXT DEFAULT 'EUR',

  -- Auto-renewal
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(stripe_customer_id),
  UNIQUE(stripe_subscription_id)
);

CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_plan ON public.subscriptions(plan);
CREATE INDEX idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);

-- ============================================================================
-- TEMPLATES
-- ============================================================================

CREATE TABLE public.template_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  thumbnail_url TEXT,

  -- Schema definition for the template
  schema_fields JSONB NOT NULL, -- Array of field definitions
  example_data JSONB,

  -- SEO & Discovery
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  featured BOOLEAN DEFAULT false,
  difficulty_level TEXT DEFAULT 'beginner',

  -- Subscription requirements
  min_plan subscription_plan DEFAULT 'free',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_template_catalog_category ON public.template_catalog(category);
CREATE INDEX idx_template_catalog_featured ON public.template_catalog(featured);
CREATE INDEX idx_template_catalog_min_plan ON public.template_catalog(min_plan);

CREATE TABLE public.template_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.template_catalog(id) ON DELETE RESTRICT,

  -- Response data stored as JSONB
  data JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Metadata
  title TEXT,
  version INT DEFAULT 1,
  status TEXT DEFAULT 'draft', -- draft, published, archived
  notes TEXT,

  -- AI enhancements
  ai_suggestions_requested BOOLEAN DEFAULT false,
  ai_feedback JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_template_responses_user ON public.template_responses(user_id);
CREATE INDEX idx_template_responses_template ON public.template_responses(template_id);
CREATE INDEX idx_template_responses_status ON public.template_responses(status);

-- ============================================================================
-- STRATEGY BUILDER (39-Question Questionnaire)
-- ============================================================================

CREATE TABLE public.questionnaire_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_number INT NOT NULL UNIQUE, -- 1-7
  section_name TEXT NOT NULL,
  section_description TEXT,
  question_count INT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.questionnaire_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES public.questionnaire_sections(id) ON DELETE CASCADE,

  question_number INT NOT NULL, -- 1-39 across all sections
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL, -- text, textarea, select, multiselect, scale, radio
  required BOOLEAN DEFAULT true,

  -- For select/multiselect/radio questions
  options JSONB, -- Array of {label, value}

  -- For scale questions
  scale_min INT,
  scale_max INT,
  scale_min_label TEXT,
  scale_max_label TEXT,

  help_text TEXT,
  placeholder TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(section_id, question_number)
);

CREATE INDEX idx_questionnaire_questions_section ON public.questionnaire_questions(section_id);

CREATE TABLE public.strategy_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,

  -- Project status
  status TEXT DEFAULT 'in_progress', -- in_progress, completed, archived
  completion_percentage INT DEFAULT 0,

  -- AI generation
  strategy_generated BOOLEAN DEFAULT false,
  generated_strategy_id UUID, -- FK added after strategies table is created
  last_ai_generation_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_strategy_projects_user ON public.strategy_projects(user_id);
CREATE INDEX idx_strategy_projects_status ON public.strategy_projects(status);

CREATE TABLE public.questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_project_id UUID NOT NULL REFERENCES public.strategy_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  -- Responses organized by section
  section_1_responses JSONB DEFAULT '{}'::jsonb, -- Business Foundation (Qs 1-6)
  section_2_responses JSONB DEFAULT '{}'::jsonb, -- Target Audience (Qs 7-12)
  section_3_responses JSONB DEFAULT '{}'::jsonb, -- Competitive Landscape (Qs 13-18)
  section_4_responses JSONB DEFAULT '{}'::jsonb, -- Value Proposition (Qs 19-24)
  section_5_responses JSONB DEFAULT '{}'::jsonb, -- Marketing Goals (Qs 25-30)
  section_6_responses JSONB DEFAULT '{}'::jsonb, -- Current Challenges (Qs 31-36)
  section_7_responses JSONB DEFAULT '{}'::jsonb, -- Future Vision (Qs 37-39)

  -- Completion tracking
  completed_sections INT[] DEFAULT ARRAY[]::INT[],
  all_sections_completed BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_questionnaire_responses_project ON public.questionnaire_responses(strategy_project_id);
CREATE INDEX idx_questionnaire_responses_user ON public.questionnaire_responses(user_id);

-- ============================================================================
-- AI INTERVIEWS (Voice/Video)
-- ============================================================================

CREATE TABLE public.ai_interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_project_id UUID NOT NULL REFERENCES public.strategy_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  -- Interview metadata
  title TEXT,
  transcript TEXT,
  duration_seconds INT,

  -- Processing
  transcript_processed BOOLEAN DEFAULT false,
  key_insights JSONB, -- AI-extracted insights
  sentiment_analysis JSONB, -- Overall sentiment from transcript

  -- Storage
  media_url TEXT, -- URL to stored video/audio

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_interviews_project ON public.ai_interviews(strategy_project_id);
CREATE INDEX idx_ai_interviews_user ON public.ai_interviews(user_id);

-- ============================================================================
-- STRATEGY GENERATION
-- ============================================================================

CREATE TABLE public.strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_project_id UUID NOT NULL UNIQUE REFERENCES public.strategy_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  -- Metadata
  title TEXT NOT NULL,
  summary TEXT,

  -- Generation tracking
  generation_status TEXT DEFAULT 'pending', -- pending, generating, completed, failed
  generation_error TEXT,

  -- Quality metrics
  overall_quality_score DECIMAL(3,1), -- 0-10 scale

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  generated_at TIMESTAMP WITH TIME ZONE,

  UNIQUE(strategy_project_id)
);

CREATE INDEX idx_strategies_user ON public.strategies(user_id);
CREATE INDEX idx_strategies_project ON public.strategies(strategy_project_id);
CREATE INDEX idx_strategies_status ON public.strategies(generation_status);

-- Add deferred FK from strategy_projects to strategies
ALTER TABLE public.strategy_projects
  ADD CONSTRAINT fk_strategy_projects_generated_strategy
  FOREIGN KEY (generated_strategy_id)
  REFERENCES public.strategies(id) ON DELETE SET NULL;

CREATE TABLE public.strategy_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_id UUID NOT NULL REFERENCES public.strategies(id) ON DELETE CASCADE,

  -- Section definition (15 sections per strategy deck)
  section_number INT NOT NULL, -- 1-15
  section_title TEXT NOT NULL,
  section_type TEXT NOT NULL, -- e.g., 'executive_summary', 'market_analysis', etc.

  -- Content
  content JSONB NOT NULL, -- Flexible structure for different section types

  -- AI Quality scoring
  quality_score DECIMAL(3,1), -- 0-10 scale
  generation_model TEXT, -- 'gpt-4', 'claude-3', etc.

  -- Regeneration tracking
  regeneration_count INT DEFAULT 0,
  last_regenerated_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(strategy_id, section_number)
);

CREATE INDEX idx_strategy_sections_strategy ON public.strategy_sections(strategy_id);
CREATE INDEX idx_strategy_sections_quality ON public.strategy_sections(quality_score);

-- ============================================================================
-- ASSETS (Brand Materials, Competitor References)
-- ============================================================================

CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  strategy_project_id UUID REFERENCES public.strategy_projects(id) ON DELETE CASCADE,

  -- Asset metadata
  asset_type TEXT NOT NULL, -- 'logo', 'brand_guidelines', 'competitor_ref', 'market_research', 'other'
  title TEXT NOT NULL,
  description TEXT,

  -- File information
  file_path TEXT NOT NULL,
  file_size_bytes INT,
  mime_type TEXT,

  -- Storage
  storage_bucket TEXT NOT NULL, -- 'brand-assets'
  storage_key TEXT NOT NULL, -- Path in Supabase Storage

  -- Usage
  used_in_generation BOOLEAN DEFAULT false,
  ai_analyzed BOOLEAN DEFAULT false,
  ai_analysis JSONB, -- Results of AI analysis

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_assets_user ON public.assets(user_id);
CREATE INDEX idx_assets_project ON public.assets(strategy_project_id);
CREATE INDEX idx_assets_type ON public.assets(asset_type);

-- ============================================================================
-- BOOKINGS (Human Consultations with Gabriel)
-- ============================================================================

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  -- Booking details
  consultant_id TEXT DEFAULT 'gabriel', -- Future: allow multiple consultants
  title TEXT NOT NULL,
  description TEXT,

  -- Scheduling
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INT DEFAULT 60,

  -- Status and outcome
  status booking_status DEFAULT 'pending',
  meeting_link TEXT, -- Zoom/Google Meet link
  notes TEXT,

  -- Follow-up
  follow_up_sent BOOLEAN DEFAULT false,
  follow_up_resources JSONB, -- Array of resource links

  -- Cancellation
  canceled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bookings_user ON public.bookings(user_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_scheduled ON public.bookings(scheduled_at);

-- ============================================================================
-- 90-DAY GROWTH CHALLENGE
-- ============================================================================

CREATE TABLE public.challenge_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  -- Challenge instance
  challenge_cohort TEXT NOT NULL, -- e.g., '2024-Q1', used for community grouping

  -- Tracking
  status challenge_status DEFAULT 'not_started',
  enrollment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  start_date TIMESTAMP WITH TIME ZONE,
  completion_date TIMESTAMP WITH TIME ZONE,

  -- Progress summary
  weeks_completed INT DEFAULT 0,
  total_assignments_submitted INT DEFAULT 0,
  current_streak INT DEFAULT 0, -- consecutive weeks completed

  -- Certificates
  certificate_earned BOOLEAN DEFAULT false,
  certificate_issued_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, challenge_cohort)
);

CREATE INDEX idx_challenge_enrollments_user ON public.challenge_enrollments(user_id);
CREATE INDEX idx_challenge_enrollments_status ON public.challenge_enrollments(status);
CREATE INDEX idx_challenge_enrollments_cohort ON public.challenge_enrollments(challenge_cohort);

CREATE TABLE public.challenge_weeks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_number INT NOT NULL UNIQUE, -- 1-12
  title TEXT NOT NULL,
  description TEXT,

  -- Content
  learning_objectives TEXT[],
  resources JSONB, -- Array of {title, url, type}
  assignment JSONB NOT NULL, -- {title, description, submission_format}

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.challenge_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES public.challenge_enrollments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  week_id UUID NOT NULL REFERENCES public.challenge_weeks(id) ON DELETE RESTRICT,

  -- Week tracking
  week_number INT NOT NULL,

  -- Submission
  assignment_completed BOOLEAN DEFAULT false,
  assignment_submission TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,

  -- Feedback
  feedback_provided BOOLEAN DEFAULT false,
  feedback_text TEXT,
  feedback_rating INT, -- 1-5

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(enrollment_id, week_number)
);

CREATE INDEX idx_challenge_progress_enrollment ON public.challenge_progress(enrollment_id);
CREATE INDEX idx_challenge_progress_user ON public.challenge_progress(user_id);

-- ============================================================================
-- COMMUNITY & WALL OF FAME
-- ============================================================================

CREATE TABLE public.community_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  -- Public profile
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,

  -- Status in community
  featured_on_wall_of_fame BOOLEAN DEFAULT false,
  wall_of_fame_rank INT, -- 1 = top, lower is better
  wall_of_fame_reason TEXT,

  -- Achievements
  challenges_completed INT DEFAULT 0,
  strategies_created INT DEFAULT 0,
  templates_used INT DEFAULT 0,

  -- Engagement
  public_profile BOOLEAN DEFAULT false,
  allow_contact BOOLEAN DEFAULT false,
  contact_email TEXT, -- separate from auth email, user provided

  -- Verification
  verified BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_community_members_featured ON public.community_members(featured_on_wall_of_fame);
CREATE INDEX idx_community_members_rank ON public.community_members(wall_of_fame_rank);
CREATE INDEX idx_community_members_public ON public.community_members(public_profile);

-- ============================================================================
-- AUDIT LOG
-- ============================================================================

CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,

  action TEXT NOT NULL, -- 'create', 'update', 'delete', etc.
  resource_type TEXT NOT NULL, -- 'strategy', 'template_response', etc.
  resource_id UUID,

  changes JSONB, -- {before, after} or details
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_resource ON public.audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_log_created ON public.audit_log(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can read their own and public profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view public community profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.community_members
      WHERE user_id = public.user_profiles.id AND public_profile = true
    )
  );

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Subscriptions: Users can only view/modify their own
CREATE POLICY "Users can view their own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Template Responses: Users can only access their own
CREATE POLICY "Users can view their own template responses" ON public.template_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create template responses" ON public.template_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own template responses" ON public.template_responses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own template responses" ON public.template_responses
  FOR DELETE USING (auth.uid() = user_id);

-- Strategy Projects: Users can only access their own
CREATE POLICY "Users can view their own strategy projects" ON public.strategy_projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create strategy projects" ON public.strategy_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own strategy projects" ON public.strategy_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own strategy projects" ON public.strategy_projects
  FOR DELETE USING (auth.uid() = user_id);

-- Questionnaire Responses: Users can only access their own
CREATE POLICY "Users can view their own questionnaire responses" ON public.questionnaire_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create questionnaire responses" ON public.questionnaire_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questionnaire responses" ON public.questionnaire_responses
  FOR UPDATE USING (auth.uid() = user_id);

-- Strategies: Users can only access their own
CREATE POLICY "Users can view their own strategies" ON public.strategies
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own strategies" ON public.strategies
  FOR UPDATE USING (auth.uid() = user_id);

-- Strategy Sections: Accessible through strategy parent
CREATE POLICY "Users can view sections of their strategies" ON public.strategy_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.strategies
      WHERE strategies.id = strategy_sections.strategy_id
      AND strategies.user_id = auth.uid()
    )
  );

-- AI Interviews: Users can only access their own
CREATE POLICY "Users can view their own interviews" ON public.ai_interviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create interviews" ON public.ai_interviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interviews" ON public.ai_interviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Assets: Users can only access their own
CREATE POLICY "Users can view their own assets" ON public.assets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create assets" ON public.assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assets" ON public.assets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assets" ON public.assets
  FOR DELETE USING (auth.uid() = user_id);

-- Bookings: Users can only view their own, but anyone can create
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can cancel their own bookings" ON public.bookings
  FOR DELETE USING (auth.uid() = user_id);

-- Challenge Enrollments: Users can only view their own
CREATE POLICY "Users can view their own challenge enrollments" ON public.challenge_enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create challenge enrollments" ON public.challenge_enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enrollments" ON public.challenge_enrollments
  FOR UPDATE USING (auth.uid() = user_id);

-- Challenge Progress: Users can only view their own
CREATE POLICY "Users can view their own challenge progress" ON public.challenge_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create challenge progress" ON public.challenge_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.challenge_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Community Members: Public profiles are public, private profiles are owner-only
CREATE POLICY "Anyone can view public community profiles" ON public.community_members
  FOR SELECT USING (public_profile = true);

CREATE POLICY "Users can view their own community profile" ON public.community_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their community profile" ON public.community_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their community profile" ON public.community_members
  FOR UPDATE USING (auth.uid() = user_id);

-- Audit Log: Users can view their own, admins can view all
CREATE POLICY "Users can view their own audit logs" ON public.audit_log
  FOR SELECT USING (auth.uid() = user_id);

-- Template Catalog: Everyone can read
CREATE POLICY "Anyone can view template catalog" ON public.template_catalog
  FOR SELECT USING (true);

-- Questionnaire Questions & Sections: Everyone can read
CREATE POLICY "Anyone can view questionnaire" ON public.questionnaire_questions
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view questionnaire sections" ON public.questionnaire_sections
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view challenge weeks" ON public.challenge_weeks
  FOR SELECT USING (true);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update user last_login_at
CREATE OR REPLACE FUNCTION public.update_user_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.user_profiles
  SET last_login_at = NOW()
  WHERE id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_template_responses_updated_at BEFORE UPDATE ON public.template_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_strategy_projects_updated_at BEFORE UPDATE ON public.strategy_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_questionnaire_responses_updated_at BEFORE UPDATE ON public.questionnaire_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_strategies_updated_at BEFORE UPDATE ON public.strategies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_strategy_sections_updated_at BEFORE UPDATE ON public.strategy_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_interviews_updated_at BEFORE UPDATE ON public.ai_interviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_challenge_enrollments_updated_at BEFORE UPDATE ON public.challenge_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_challenge_progress_updated_at BEFORE UPDATE ON public.challenge_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_members_updated_at BEFORE UPDATE ON public.community_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate strategy project completion
CREATE OR REPLACE FUNCTION public.calculate_project_completion(project_id UUID)
RETURNS INT AS $$
DECLARE
  total_sections INT := 7;
  completed_sections INT;
BEGIN
  SELECT COUNT(*) INTO completed_sections
  FROM public.questionnaire_responses
  WHERE strategy_project_id = project_id
  AND (completed_sections @> ARRAY[1] OR completed_sections @> ARRAY[2]
    OR completed_sections @> ARRAY[3] OR completed_sections @> ARRAY[4]
    OR completed_sections @> ARRAY[5] OR completed_sections @> ARRAY[6]
    OR completed_sections @> ARRAY[7]);

  RETURN ROUND((completed_sections::NUMERIC / total_sections) * 100)::INT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID,
  p_changes JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
BEGIN
  INSERT INTO public.audit_log (user_id, action, resource_type, resource_id, changes)
  VALUES (auth.uid(), p_action, p_resource_type, p_resource_id, p_changes)
  RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
