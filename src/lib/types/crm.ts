// CRM, Marketing Email, Analytics & Dashboard types
// Corresponds to migration 00010_crm_marketing_analytics.sql

// ─── Companies ──────────────────────────────────────────────────

export type CompanyRow = {
  id: string
  user_id: string
  name: string
  owner_id: string | null
  phone: string | null
  city: string | null
  country: string | null
  website: string | null
  industry: string | null
  description: string | null
  employee_count: number | null
  annual_revenue_cents: number | null
  lifecycle_stage: string
  last_activity_at: string | null
  custom_properties: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type CompanyInsert = {
  name: string
  owner_id?: string | null
  phone?: string | null
  city?: string | null
  country?: string | null
  website?: string | null
  industry?: string | null
  description?: string | null
  employee_count?: number | null
  annual_revenue_cents?: number | null
  lifecycle_stage?: string
  custom_properties?: Record<string, unknown>
}

export type CompanyUpdate = Partial<CompanyInsert>

// ─── Activities ─────────────────────────────────────────────────

export type ActivityType =
  | 'note' | 'email_sent' | 'email_opened' | 'email_clicked'
  | 'call' | 'meeting' | 'form_submission' | 'deal_created'
  | 'deal_stage_changed' | 'owner_changed' | 'company_created'
  | 'task_completed' | 'custom'

export type ActivityRow = {
  id: string
  user_id: string
  entity_type: string
  entity_id: string
  activity_type: ActivityType
  actor_id: string | null
  occurred_at: string
  title: string | null
  body: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export type ActivityInsert = {
  entity_type: string
  entity_id: string
  activity_type: ActivityType
  actor_id?: string | null
  occurred_at?: string
  title?: string | null
  body?: string | null
  metadata?: Record<string, unknown>
}

// ─── Saved Views ────────────────────────────────────────────────

export type FilterPredicate = {
  field: string
  operator: 'eq' | 'neq' | 'contains' | 'not_contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'between' | 'is_empty' | 'is_not_empty' | 'in' | 'not_in'
  value: unknown
}

export type SortSpec = {
  field: string
  direction: 'asc' | 'desc'
}

export type SavedViewRow = {
  id: string
  user_id: string
  entity_type: string
  name: string
  filters: FilterPredicate[]
  sort: SortSpec[]
  columns: string[]
  is_default: boolean
  is_shared: boolean
  created_at: string
  updated_at: string
}

export type SavedViewInsert = {
  entity_type: string
  name: string
  filters?: FilterPredicate[]
  sort?: SortSpec[]
  columns?: string[]
  is_default?: boolean
  is_shared?: boolean
}

// ─── Export Jobs ─────────────────────────────────────────────────

export type ExportFormat = 'csv' | 'xlsx'
export type ExportStatus = 'queued' | 'processing' | 'completed' | 'failed'

export type ExportJobRow = {
  id: string
  user_id: string
  entity_type: string
  filters: Record<string, unknown>
  columns: string[]
  format: ExportFormat
  status: ExportStatus
  file_url: string | null
  row_count: number | null
  error_message: string | null
  requested_at: string
  completed_at: string | null
}

// ─── Marketing Email Templates ──────────────────────────────────

export type EmailTemplateCategory = 'simple' | 'newsletter' | 'promotion' | 'transactional' | 'custom'

export type MarketingEmailTemplateRow = {
  id: string
  user_id: string | null
  name: string
  category: EmailTemplateCategory
  description: string | null
  thumbnail_url: string | null
  is_recommended: boolean
  content_html: string | null
  content_structure: Record<string, unknown> | null
  status: string
  sort_order: number
  created_at: string
  updated_at: string
}

export type MarketingEmailTemplateInsert = {
  name: string
  category: EmailTemplateCategory
  description?: string | null
  thumbnail_url?: string | null
  is_recommended?: boolean
  content_html?: string | null
  content_structure?: Record<string, unknown> | null
}

// ─── Marketing Email Drafts / Campaigns ─────────────────────────

export type EmailDraftStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'canceled' | 'failed'
export type EmailAudienceType = 'segment' | 'list' | 'manual' | 'all_contacts'

export type MarketingEmailDraftRow = {
  id: string
  user_id: string
  template_id: string | null
  name: string
  subject: string | null
  preview_text: string | null
  from_name: string | null
  from_email: string | null
  content_html: string | null
  content_structure: Record<string, unknown> | null
  audience_type: EmailAudienceType | null
  audience_id: string | null
  audience_filter: Record<string, unknown> | null
  status: EmailDraftStatus
  scheduled_at: string | null
  sent_at: string | null
  canceled_at: string | null
  recipient_count: number
  total_sent: number
  total_opened: number
  total_clicked: number
  created_at: string
  updated_at: string
}

export type MarketingEmailDraftInsert = {
  template_id?: string | null
  name?: string
  subject?: string | null
  preview_text?: string | null
  from_name?: string | null
  from_email?: string | null
  content_html?: string | null
  content_structure?: Record<string, unknown> | null
  audience_type?: EmailAudienceType | null
  audience_id?: string | null
  audience_filter?: Record<string, unknown> | null
  status?: EmailDraftStatus
  scheduled_at?: string | null
}

export type MarketingEmailDraftUpdate = Partial<MarketingEmailDraftInsert>

// ─── Email Send Events ──────────────────────────────────────────

export type EmailSendEventRow = {
  id: string
  campaign_id: string
  contact_email: string
  contact_id: string | null
  sent_at: string | null
  delivered_at: string | null
  opened_at: string | null
  clicked_at: string | null
  bounced_at: string | null
  unsubscribed_at: string | null
  esp_message_id: string | null
  error_message: string | null
  created_at: string
}

// ─── Tracking Events ────────────────────────────────────────────

export type TrackingEventType =
  | 'page_view' | 'form_submission' | 'cta_view' | 'cta_click'
  | 'entrance' | 'exit' | 'bounce'
  | 'email_sent' | 'email_opened' | 'email_clicked'
  | 'contact_created'

export type TrackingEventInsert = {
  event_type: TrackingEventType
  occurred_at?: string
  entity_type?: string | null
  entity_id?: string | null
  contact_id?: string | null
  contact_email?: string | null
  metadata?: Record<string, unknown>
  session_id?: string | null
}

// ─── Metric Rollups ─────────────────────────────────────────────

export type MetricRollupGranularity = 'hourly' | 'daily' | 'weekly' | 'monthly'

export type MetricRollupRow = {
  id: string
  user_id: string
  entity_type: string
  entity_id: string
  metric_name: string
  granularity: MetricRollupGranularity
  bucket_start: string
  bucket_end: string
  value: number
  numerator: number | null
  denominator: number | null
  computed_at: string
}

// ─── Dashboards ─────────────────────────────────────────────────

export type DashboardAccessLevel = 'everyone_can_edit' | 'everyone_can_view' | 'restricted'

export type DashboardRow = {
  id: string
  user_id: string
  title: string
  description: string | null
  created_by: string | null
  access_level: DashboardAccessLevel
  default_filters: Record<string, unknown>
  layout: Record<string, unknown>[]
  created_at: string
  updated_at: string
}

export type DashboardInsert = {
  title?: string
  description?: string | null
  access_level?: DashboardAccessLevel
  default_filters?: Record<string, unknown>
  layout?: Record<string, unknown>[]
}

export type DashboardUpdate = Partial<DashboardInsert>

// ─── Dashboard Widgets ──────────────────────────────────────────

export type DashboardWidgetRow = {
  id: string
  dashboard_id: string
  title: string
  widget_type: string
  metric_source: string
  metric_config: Record<string, unknown>
  position_row: number
  position_col: number
  width: number
  height: number
  filter_overrides: Record<string, unknown>
  sort_order: number
  created_at: string
  updated_at: string
}

export type DashboardWidgetInsert = {
  dashboard_id: string
  title: string
  widget_type: string
  metric_source: string
  metric_config?: Record<string, unknown>
  position_row?: number
  position_col?: number
  width?: number
  height?: number
  filter_overrides?: Record<string, unknown>
  sort_order?: number
}

export type DashboardWidgetUpdate = Partial<Omit<DashboardWidgetInsert, 'dashboard_id'>>

// ─── API Request/Response Types ─────────────────────────────────

export type CompanyListParams = {
  page?: number
  per_page?: number
  search?: string
  filters?: FilterPredicate[]
  sort?: SortSpec
  tab?: 'all' | 'my'
  columns?: string[]
}

export type PaginatedResponse<T> = {
  data: T[]
  total_count: number
  page: number
  per_page: number
  has_more: boolean
}

export type MetricQueryParams = {
  entity_type: string
  metric_names: string[]
  granularity?: MetricRollupGranularity
  start_date: string
  end_date: string
  compare_start_date?: string
  compare_end_date?: string
  entity_id?: string
  group_by?: string
  order_by?: string
  limit?: number
}

export type MetricQueryResult = {
  primary: MetricBucket[]
  comparison: MetricBucket[] | null
  has_data: boolean
}

export type MetricBucket = {
  entity_type: string
  entity_id: string | null
  metric_name: string
  bucket_start: string
  bucket_end: string
  value: number
}
