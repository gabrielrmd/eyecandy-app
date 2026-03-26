-- ============================================================================
-- CRM, MARKETING EMAIL, ANALYTICS & DASHBOARD SYSTEM
--
-- Adds backend support for:
--   1. Companies module (CRM records, ownership, activities)
--   2. Marketing email templates, drafts/campaigns, send events
--   3. Event tracking & metric rollups for analytics
--   4. Configurable dashboards with widgets
--   5. Shared: saved views, export jobs
-- ============================================================================

BEGIN;

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE company_owner_source AS ENUM ('manual', 'import', 'auto_assign');

CREATE TYPE activity_type AS ENUM (
  'note', 'email_sent', 'email_opened', 'email_clicked',
  'call', 'meeting', 'form_submission', 'deal_created',
  'deal_stage_changed', 'owner_changed', 'company_created',
  'task_completed', 'custom'
);

CREATE TYPE email_template_category AS ENUM ('simple', 'newsletter', 'promotion', 'transactional', 'custom');

CREATE TYPE email_draft_status AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'canceled', 'failed');

CREATE TYPE email_audience_type AS ENUM ('segment', 'list', 'manual', 'all_contacts');

CREATE TYPE export_format AS ENUM ('csv', 'xlsx');
CREATE TYPE export_status AS ENUM ('queued', 'processing', 'completed', 'failed');

CREATE TYPE dashboard_access_level AS ENUM ('everyone_can_edit', 'everyone_can_view', 'restricted');

CREATE TYPE tracking_event_type AS ENUM (
  'page_view', 'form_submission', 'cta_view', 'cta_click',
  'entrance', 'exit', 'bounce',
  'email_sent', 'email_opened', 'email_clicked',
  'contact_created'
);

CREATE TYPE metric_rollup_granularity AS ENUM ('hourly', 'daily', 'weekly', 'monthly');

-- ============================================================================
-- 1. COMPANIES
-- ============================================================================

CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  -- user_id = workspace owner / creator (all data is user-scoped in this app)

  -- Core fields (PRD §9)
  name TEXT NOT NULL,
  owner_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  phone TEXT,
  city TEXT,
  country TEXT,
  website TEXT,
  industry TEXT,
  description TEXT,
  employee_count INT,
  annual_revenue_cents BIGINT,
  lifecycle_stage TEXT DEFAULT 'lead', -- lead, opportunity, customer, other

  -- Derived field: updated by trigger/function when activities are recorded
  last_activity_at TIMESTAMP WITH TIME ZONE,

  -- Flexible properties for custom fields (PRD §9 — "Edit columns" implies extensible schema)
  custom_properties JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes per PRD §19.1
CREATE INDEX idx_companies_user ON public.companies(user_id);
CREATE INDEX idx_companies_user_owner ON public.companies(user_id, owner_id);
CREATE INDEX idx_companies_user_name ON public.companies(user_id, name);
CREATE INDEX idx_companies_user_created ON public.companies(user_id, created_at);
CREATE INDEX idx_companies_user_activity ON public.companies(user_id, last_activity_at);
CREATE INDEX idx_companies_user_city ON public.companies(user_id, city);
CREATE INDEX idx_companies_user_country ON public.companies(user_id, country);

-- Full-text search on company name (PRD §8.3)
CREATE INDEX idx_companies_name_trgm ON public.companies USING gin (name gin_trgm_ops);
-- Note: requires pg_trgm extension. Fallback to LIKE if not available.
-- CREATE EXTENSION IF NOT EXISTS pg_trgm; -- uncomment if not already enabled

-- ============================================================================
-- 2. ACTIVITIES (CRM activity feed — PRD §8.12)
-- ============================================================================

CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  -- Polymorphic association
  entity_type TEXT NOT NULL, -- 'company', 'contact', 'deal'
  entity_id UUID NOT NULL,

  activity_type activity_type NOT NULL,
  actor_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Flexible metadata (PRD §7.5)
  title TEXT,
  body TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activities_user ON public.activities(user_id);
CREATE INDEX idx_activities_entity ON public.activities(entity_type, entity_id);
CREATE INDEX idx_activities_occurred ON public.activities(occurred_at);
CREATE INDEX idx_activities_type ON public.activities(activity_type);

-- Function to update company.last_activity_at when an activity is inserted (PRD §8.12)
CREATE OR REPLACE FUNCTION public.update_company_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.entity_type = 'company' THEN
    UPDATE public.companies
    SET last_activity_at = NEW.occurred_at
    WHERE id = NEW.entity_id
      AND (last_activity_at IS NULL OR last_activity_at < NEW.occurred_at);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_company_last_activity
  AFTER INSERT ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.update_company_last_activity();

-- ============================================================================
-- 3. SAVED VIEWS (PRD §15.5 — shared filter/sort/column state)
-- ============================================================================

CREATE TABLE public.saved_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  entity_type TEXT NOT NULL, -- 'companies', 'contacts', 'deals'
  name TEXT NOT NULL,
  filters JSONB DEFAULT '[]'::jsonb,   -- Array of {field, operator, value}
  sort JSONB DEFAULT '[]'::jsonb,      -- Array of {field, direction}
  columns JSONB DEFAULT '[]'::jsonb,   -- Array of column keys
  is_default BOOLEAN DEFAULT false,
  is_shared BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_saved_views_user_entity ON public.saved_views(user_id, entity_type);

-- ============================================================================
-- 4. EXPORT JOBS (PRD §8.9, §14)
-- ============================================================================

CREATE TABLE public.export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  entity_type TEXT NOT NULL, -- 'companies', 'contacts', etc.
  filters JSONB DEFAULT '{}'::jsonb,
  columns JSONB DEFAULT '[]'::jsonb,
  format export_format NOT NULL DEFAULT 'csv',

  status export_status NOT NULL DEFAULT 'queued',
  file_url TEXT,
  row_count INT,
  error_message TEXT,

  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_export_jobs_user ON public.export_jobs(user_id);
CREATE INDEX idx_export_jobs_status ON public.export_jobs(status);

-- ============================================================================
-- 5. MARKETING EMAIL TEMPLATES (PRD §10.1–10.3)
-- ============================================================================

CREATE TABLE public.marketing_email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- NULL user_id = system template (available to all users)
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  category email_template_category NOT NULL DEFAULT 'simple',
  description TEXT,
  thumbnail_url TEXT,
  is_recommended BOOLEAN DEFAULT false,

  -- Template content: HTML with placeholder tokens (PRD §11.1)
  content_html TEXT,
  content_structure JSONB, -- Structured blocks for drag-and-drop editors

  status TEXT DEFAULT 'active', -- active, archived
  sort_order INT DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_met_user ON public.marketing_email_templates(user_id);
CREATE INDEX idx_met_category ON public.marketing_email_templates(category);
CREATE INDEX idx_met_recommended ON public.marketing_email_templates(is_recommended) WHERE is_recommended = true;
CREATE INDEX idx_met_status ON public.marketing_email_templates(status);

-- Seed the 3 recommended system templates visible in screenshot 2
INSERT INTO public.marketing_email_templates (user_id, name, category, description, thumbnail_url, is_recommended, content_html, sort_order) VALUES
  (NULL, 'Simple',      'simple',      'A clean, minimal email layout for straightforward messages.',        NULL, true, '<div style="max-width:600px;margin:0 auto;font-family:sans-serif;"><h1>{{headline}}</h1><p>{{body}}</p><a href="{{cta_url}}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">{{cta_text}}</a></div>', 1),
  (NULL, 'Newsletter',  'newsletter',  'Multi-section layout for regular updates and content roundups.',     NULL, true, '<div style="max-width:600px;margin:0 auto;font-family:sans-serif;"><h1>{{headline}}</h1><p>{{intro}}</p><hr/><h2>{{section_1_title}}</h2><p>{{section_1_body}}</p><hr/><h2>{{section_2_title}}</h2><p>{{section_2_body}}</p></div>', 2),
  (NULL, 'Promotion',   'promotion',   'Bold promotional layout designed for offers, launches, and sales.',  NULL, true, '<div style="max-width:600px;margin:0 auto;font-family:sans-serif;text-align:center;"><h1 style="color:#dc2626;">{{headline}}</h1><p style="font-size:18px;">{{offer_text}}</p><a href="{{cta_url}}" style="display:inline-block;padding:16px 32px;background:#dc2626;color:#fff;text-decoration:none;border-radius:8px;font-size:18px;font-weight:bold;">{{cta_text}}</a><p style="color:#6b7280;font-size:12px;">{{terms}}</p></div>', 3);

-- ============================================================================
-- 6. MARKETING EMAIL DRAFTS / CAMPAIGNS (PRD §10.4–10.8, §11.2)
-- ============================================================================

CREATE TABLE public.marketing_email_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  template_id UUID REFERENCES public.marketing_email_templates(id) ON DELETE SET NULL,

  -- Campaign metadata
  name TEXT NOT NULL DEFAULT 'Untitled Email',
  subject TEXT,
  preview_text TEXT,
  from_name TEXT,
  from_email TEXT,

  -- Content (instantiated from template or created from scratch)
  content_html TEXT,
  content_structure JSONB,

  -- Audience (PRD §10.7)
  audience_type email_audience_type,
  audience_id UUID, -- FK to a segment/list table (future)
  audience_filter JSONB, -- Inline filter definition for manual/dynamic audience

  -- Lifecycle (PRD §10.6)
  status email_draft_status NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,

  -- Aggregate counters (denormalized from send events for fast reads — PRD §11.4)
  recipient_count INT DEFAULT 0,
  total_sent INT DEFAULT 0,
  total_opened INT DEFAULT 0,
  total_clicked INT DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_med_user ON public.marketing_email_drafts(user_id);
CREATE INDEX idx_med_status ON public.marketing_email_drafts(status);
CREATE INDEX idx_med_user_status ON public.marketing_email_drafts(user_id, status);
CREATE INDEX idx_med_sent_at ON public.marketing_email_drafts(sent_at);

-- ============================================================================
-- 7. EMAIL SEND EVENTS (per-recipient — PRD §11.3)
-- ============================================================================

CREATE TABLE public.email_send_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  campaign_id UUID NOT NULL REFERENCES public.marketing_email_drafts(id) ON DELETE CASCADE,
  contact_email TEXT NOT NULL,
  contact_id UUID, -- nullable, resolved after send if contact exists

  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,

  -- ESP metadata
  esp_message_id TEXT,
  error_message TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ese_campaign ON public.email_send_events(campaign_id);
CREATE INDEX idx_ese_campaign_sent ON public.email_send_events(campaign_id, sent_at);
CREATE INDEX idx_ese_contact ON public.email_send_events(contact_id);
CREATE INDEX idx_ese_email ON public.email_send_events(contact_email);

-- Function to update draft aggregate counters when send events are updated (PRD §11.4)
CREATE OR REPLACE FUNCTION public.refresh_email_engagement_summary()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.marketing_email_drafts
  SET
    total_sent    = (SELECT COUNT(*) FROM public.email_send_events WHERE campaign_id = NEW.campaign_id AND sent_at IS NOT NULL),
    total_opened  = (SELECT COUNT(DISTINCT id) FROM public.email_send_events WHERE campaign_id = NEW.campaign_id AND opened_at IS NOT NULL),
    total_clicked = (SELECT COUNT(DISTINCT id) FROM public.email_send_events WHERE campaign_id = NEW.campaign_id AND clicked_at IS NOT NULL)
  WHERE id = NEW.campaign_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_refresh_email_engagement
  AFTER INSERT OR UPDATE ON public.email_send_events
  FOR EACH ROW EXECUTE FUNCTION public.refresh_email_engagement_summary();

-- ============================================================================
-- 8. TRACKING EVENTS (web + email — PRD §14.1)
-- ============================================================================

CREATE TABLE public.tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  -- user_id = workspace owner (data isolation)

  event_type tracking_event_type NOT NULL,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Entity association (landing page, campaign, form, CTA)
  entity_type TEXT, -- 'landing_page', 'campaign', 'form', 'cta'
  entity_id UUID,

  -- Contact association (nullable — anonymous visitors)
  contact_id UUID,
  contact_email TEXT,

  -- Event-specific data
  metadata JSONB DEFAULT '{}'::jsonb,
  -- For page_view: {url, referrer, user_agent}
  -- For cta_click: {destination_url, cta_id}
  -- For form_submission: {form_id, field_count}
  -- For exit: {time_on_page_ms}

  -- Session tracking
  session_id TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partitioning-friendly indexes (PRD §19.1)
CREATE INDEX idx_te_user_type ON public.tracking_events(user_id, event_type);
CREATE INDEX idx_te_user_occurred ON public.tracking_events(user_id, occurred_at);
CREATE INDEX idx_te_entity ON public.tracking_events(entity_type, entity_id);
CREATE INDEX idx_te_user_entity_occurred ON public.tracking_events(user_id, entity_type, entity_id, occurred_at);
CREATE INDEX idx_te_session ON public.tracking_events(session_id);

-- ============================================================================
-- 9. METRIC ROLLUPS (pre-aggregated — PRD §12.3, §14.2)
-- ============================================================================

CREATE TABLE public.metric_rollups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  -- Dimension keys
  entity_type TEXT NOT NULL, -- 'landing_page', 'campaign'
  entity_id UUID NOT NULL,
  metric_name TEXT NOT NULL, -- 'page_views', 'form_submissions', 'cta_clicks', 'email_sent', etc.
  granularity metric_rollup_granularity NOT NULL DEFAULT 'daily',

  -- Time bucket
  bucket_start TIMESTAMP WITH TIME ZONE NOT NULL,
  bucket_end TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Aggregated value
  value BIGINT NOT NULL DEFAULT 0,

  -- For rate metrics (optional numerator/denominator)
  numerator BIGINT,
  denominator BIGINT,

  computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint for upsert
  UNIQUE(user_id, entity_type, entity_id, metric_name, granularity, bucket_start)
);

CREATE INDEX idx_mr_user_entity ON public.metric_rollups(user_id, entity_type, entity_id);
CREATE INDEX idx_mr_user_bucket ON public.metric_rollups(user_id, bucket_start, bucket_end);
CREATE INDEX idx_mr_query ON public.metric_rollups(user_id, entity_type, metric_name, granularity, bucket_start);

-- ============================================================================
-- 10. DASHBOARDS (PRD §13)
-- ============================================================================

CREATE TABLE public.dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  title TEXT NOT NULL DEFAULT 'Untitled Dashboard',
  description TEXT,
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,

  access_level dashboard_access_level NOT NULL DEFAULT 'everyone_can_edit',

  -- Default filters applied to all widgets (PRD §13.5)
  default_filters JSONB DEFAULT '{}'::jsonb,

  -- Layout metadata (widget positions — PRD §13.3)
  layout JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_dashboards_user ON public.dashboards(user_id);
CREATE INDEX idx_dashboards_created_by ON public.dashboards(created_by);

-- ============================================================================
-- 11. DASHBOARD WIDGETS (PRD §13.3, §7.12)
-- ============================================================================

CREATE TABLE public.dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES public.dashboards(id) ON DELETE CASCADE,

  -- Widget display
  title TEXT NOT NULL,
  widget_type TEXT NOT NULL, -- 'table', 'line_chart', 'bar_chart', 'metric_card', 'area_chart'

  -- Data source config (PRD §13.3)
  metric_source TEXT NOT NULL, -- 'landing_page', 'email', 'combined'
  metric_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- metric_config: {metrics: [...], group_by, order_by, limit}

  -- Position in dashboard grid (PRD §13.3)
  position_row INT DEFAULT 0,
  position_col INT DEFAULT 0,
  width INT DEFAULT 6,     -- out of 12-column grid
  height INT DEFAULT 4,    -- in grid units

  -- Widget-level filter overrides
  filter_overrides JSONB DEFAULT '{}'::jsonb,

  sort_order INT DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_dw_dashboard ON public.dashboard_widgets(dashboard_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_email_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_send_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metric_rollups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- Companies: users see their own (PRD §16.1)
CREATE POLICY "Users can view their own companies" ON public.companies
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create companies" ON public.companies
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own companies" ON public.companies
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own companies" ON public.companies
  FOR DELETE USING (auth.uid() = user_id);

-- Activities: users see their own
CREATE POLICY "Users can view their own activities" ON public.activities
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create activities" ON public.activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Saved Views: users see their own + shared
CREATE POLICY "Users can view own and shared views" ON public.saved_views
  FOR SELECT USING (auth.uid() = user_id OR is_shared = true);
CREATE POLICY "Users can create saved views" ON public.saved_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own views" ON public.saved_views
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own views" ON public.saved_views
  FOR DELETE USING (auth.uid() = user_id);

-- Export Jobs: users see their own
CREATE POLICY "Users can view their own exports" ON public.export_jobs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create exports" ON public.export_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Marketing Email Templates: system templates (user_id IS NULL) + user's own
CREATE POLICY "Users can view system and own templates" ON public.marketing_email_templates
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Users can create their own templates" ON public.marketing_email_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own templates" ON public.marketing_email_templates
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own templates" ON public.marketing_email_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Marketing Email Drafts: users see their own
CREATE POLICY "Users can view their own email drafts" ON public.marketing_email_drafts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create email drafts" ON public.marketing_email_drafts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own email drafts" ON public.marketing_email_drafts
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own email drafts" ON public.marketing_email_drafts
  FOR DELETE USING (auth.uid() = user_id);

-- Email Send Events: accessible through parent draft
CREATE POLICY "Users can view send events for their campaigns" ON public.email_send_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.marketing_email_drafts
      WHERE marketing_email_drafts.id = email_send_events.campaign_id
        AND marketing_email_drafts.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create send events for their campaigns" ON public.email_send_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.marketing_email_drafts
      WHERE marketing_email_drafts.id = email_send_events.campaign_id
        AND marketing_email_drafts.user_id = auth.uid()
    )
  );

-- Tracking Events: users see their own
CREATE POLICY "Users can view their own tracking events" ON public.tracking_events
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create tracking events" ON public.tracking_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Metric Rollups: users see their own
CREATE POLICY "Users can view their own rollups" ON public.metric_rollups
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create rollups" ON public.metric_rollups
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own rollups" ON public.metric_rollups
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Dashboards: users see their own (PRD §16.2)
CREATE POLICY "Users can view their own dashboards" ON public.dashboards
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create dashboards" ON public.dashboards
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own dashboards" ON public.dashboards
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own dashboards" ON public.dashboards
  FOR DELETE USING (auth.uid() = user_id);

-- Dashboard Widgets: accessible through parent dashboard
CREATE POLICY "Users can view widgets of their dashboards" ON public.dashboard_widgets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.dashboards
      WHERE dashboards.id = dashboard_widgets.dashboard_id
        AND dashboards.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create widgets on their dashboards" ON public.dashboard_widgets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dashboards
      WHERE dashboards.id = dashboard_widgets.dashboard_id
        AND dashboards.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update widgets on their dashboards" ON public.dashboard_widgets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.dashboards
      WHERE dashboards.id = dashboard_widgets.dashboard_id
        AND dashboards.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete widgets from their dashboards" ON public.dashboard_widgets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.dashboards
      WHERE dashboards.id = dashboard_widgets.dashboard_id
        AND dashboards.user_id = auth.uid()
    )
  );

-- ============================================================================
-- TRIGGERS (updated_at)
-- ============================================================================

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_saved_views_updated_at
  BEFORE UPDATE ON public.saved_views
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_met_updated_at
  BEFORE UPDATE ON public.marketing_email_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_med_updated_at
  BEFORE UPDATE ON public.marketing_email_drafts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboards_updated_at
  BEFORE UPDATE ON public.dashboards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dw_updated_at
  BEFORE UPDATE ON public.dashboard_widgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Compute daily metric rollups for a given user and date range (PRD §12.3)
-- Called by a scheduled job or on-demand
CREATE OR REPLACE FUNCTION public.compute_daily_rollups(
  p_user_id UUID,
  p_date DATE DEFAULT CURRENT_DATE - 1
)
RETURNS VOID AS $$
DECLARE
  v_start TIMESTAMP WITH TIME ZONE := p_date::timestamp with time zone;
  v_end   TIMESTAMP WITH TIME ZONE := (p_date + 1)::timestamp with time zone;
BEGIN
  -- Aggregate tracking events by entity + event type into daily rollups
  INSERT INTO public.metric_rollups (user_id, entity_type, entity_id, metric_name, granularity, bucket_start, bucket_end, value, computed_at)
  SELECT
    p_user_id,
    te.entity_type,
    te.entity_id,
    te.event_type::text,
    'daily'::metric_rollup_granularity,
    v_start,
    v_end,
    COUNT(*),
    NOW()
  FROM public.tracking_events te
  WHERE te.user_id = p_user_id
    AND te.occurred_at >= v_start
    AND te.occurred_at < v_end
    AND te.entity_type IS NOT NULL
    AND te.entity_id IS NOT NULL
  GROUP BY te.entity_type, te.entity_id, te.event_type
  ON CONFLICT (user_id, entity_type, entity_id, metric_name, granularity, bucket_start)
  DO UPDATE SET
    value = EXCLUDED.value,
    computed_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log an activity and auto-update company.last_activity_at (convenience wrapper)
CREATE OR REPLACE FUNCTION public.log_company_activity(
  p_user_id UUID,
  p_company_id UUID,
  p_activity_type activity_type,
  p_title TEXT DEFAULT NULL,
  p_body TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
BEGIN
  INSERT INTO public.activities (user_id, entity_type, entity_id, activity_type, actor_id, title, body, metadata)
  VALUES (p_user_id, 'company', p_company_id, p_activity_type, p_user_id, p_title, p_body, p_metadata)
  RETURNING id INTO v_activity_id;

  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
