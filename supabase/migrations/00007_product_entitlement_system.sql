-- ============================================================================
-- PRODUCT & ENTITLEMENT SYSTEM
-- Replaces the old single-subscription model with a full product/entitlement
-- architecture supporting: subscriptions, one-time purchases, credits,
-- top-ups, bundles, and manual fulfillment offers.
-- ============================================================================

-- New product type enum
CREATE TYPE product_type AS ENUM (
  'subscription',   -- recurring (templates, circle, agency)
  'one_time',       -- single purchase (strategy builder standalone)
  'credit_pack',    -- top-up credits
  'manual'          -- 1:1 consulting, custom fulfillment
);

-- New entitlement type enum
CREATE TYPE entitlement_type AS ENUM (
  'templates',        -- access to template library
  'strategy_builder', -- access to strategy builder + credits
  'circle',           -- access to community/circle
  'agency',           -- white-label agency features
  'consulting'        -- 1:1 consulting status
);

CREATE TYPE entitlement_status AS ENUM (
  'active',
  'expired',
  'canceled',
  'suspended'
);

-- ============================================================================
-- PRODUCTS TABLE — defines what can be purchased
-- ============================================================================
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,                    -- e.g. 'essentials_monthly'
  name TEXT NOT NULL,                     -- display name
  description TEXT,
  product_type product_type NOT NULL,

  -- Stripe mapping
  stripe_product_id TEXT,
  stripe_price_id TEXT,

  -- Pricing (display only — Stripe is source of truth)
  price_cents INT,
  currency TEXT DEFAULT 'EUR',
  billing_interval TEXT,                  -- 'month', 'year', or NULL for one-time

  -- What this product grants
  grants_entitlements entitlement_type[] NOT NULL DEFAULT '{}',
  grants_strategy_credits INT DEFAULT 0,  -- credits included with purchase

  -- Duration for subscriptions (in days, NULL = follows Stripe billing)
  duration_days INT,

  -- Display
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- USER ENTITLEMENTS TABLE — what each user currently has access to
-- ============================================================================
CREATE TABLE public.user_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  entitlement entitlement_type NOT NULL,
  status entitlement_status NOT NULL DEFAULT 'active',

  -- Source tracking
  source_product_id TEXT REFERENCES public.products(id),
  stripe_subscription_id TEXT,

  -- Validity period
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,  -- NULL = no expiry (lifetime or manual)

  -- Admin override
  granted_by TEXT,                       -- 'purchase', 'admin', 'bundle', 'trial'
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_entitlements_user ON public.user_entitlements(user_id);
CREATE INDEX idx_user_entitlements_status ON public.user_entitlements(status);
CREATE INDEX idx_user_entitlements_type ON public.user_entitlements(entitlement);
CREATE UNIQUE INDEX idx_user_entitlements_unique_active
  ON public.user_entitlements(user_id, entitlement)
  WHERE status = 'active';

-- ============================================================================
-- STRATEGY CREDITS TABLE — tracks credit balance per user
-- ============================================================================
CREATE TABLE public.strategy_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  -- Balance
  credits_remaining INT NOT NULL DEFAULT 0,
  credits_total INT NOT NULL DEFAULT 0,        -- total ever granted
  credits_used INT NOT NULL DEFAULT 0,         -- total ever consumed

  -- Unlimited flag (for Agency tier)
  unlimited BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id)
);

CREATE INDEX idx_strategy_credits_user ON public.strategy_credits(user_id);

-- ============================================================================
-- CREDIT TRANSACTIONS TABLE — audit log for credit changes
-- ============================================================================
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  -- Transaction details
  amount INT NOT NULL,                         -- positive = added, negative = consumed
  reason TEXT NOT NULL,                        -- 'purchase', 'top_up', 'generation', 'admin_grant', 'refund'

  -- Source
  source_product_id TEXT REFERENCES public.products(id),
  strategy_project_id UUID,                    -- which strategy consumed the credit

  -- Balance after this transaction
  balance_after INT NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_credit_transactions_user ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created ON public.credit_transactions(created_at);

-- ============================================================================
-- PURCHASES TABLE — records every completed purchase
-- ============================================================================
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id),

  -- Stripe
  stripe_checkout_session_id TEXT,
  stripe_subscription_id TEXT,
  stripe_invoice_id TEXT,

  -- Amount
  amount_cents INT,
  currency TEXT DEFAULT 'EUR',

  -- Status
  status TEXT NOT NULL DEFAULT 'completed',   -- 'completed', 'refunded', 'pending'

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_purchases_user ON public.purchases(user_id);
CREATE INDEX idx_purchases_product ON public.purchases(product_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- Products: readable by everyone (public catalog)
CREATE POLICY "Products are publicly readable" ON public.products
  FOR SELECT USING (true);

-- Entitlements: users see their own
CREATE POLICY "Users can view their own entitlements" ON public.user_entitlements
  FOR SELECT USING (auth.uid() = user_id);

-- Strategy credits: users see their own
CREATE POLICY "Users can view their own credits" ON public.strategy_credits
  FOR SELECT USING (auth.uid() = user_id);

-- Credit transactions: users see their own
CREATE POLICY "Users can view their own credit transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Purchases: users see their own
CREATE POLICY "Users can view their own purchases" ON public.purchases
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- SEED PRODUCT DATA
-- ============================================================================
INSERT INTO public.products (id, name, description, product_type, price_cents, currency, billing_interval, grants_entitlements, grants_strategy_credits, sort_order) VALUES

-- Core tiers
('essentials_monthly',    'Essentials',        'Templates subscription — monthly',  'subscription', 2900,   'EUR', 'month', '{templates}',                           0, 10),
('essentials_yearly',     'Essentials',        'Templates subscription — yearly',   'subscription', 24900,  'EUR', 'year',  '{templates}',                           0, 11),
('professional_monthly',  'Professional',      'Full platform — monthly',           'subscription', 7900,   'EUR', 'month', '{templates,strategy_builder,circle}',   5, 20),
('professional_yearly',   'Professional',      'Full platform — yearly',            'subscription', 69900,  'EUR', 'year',  '{templates,strategy_builder,circle}',   5, 21),
('agency_monthly',        'Agency',            'White-label — monthly',             'subscription', 24900,  'EUR', 'month', '{templates,strategy_builder,circle,agency}', 0, 30),
('agency_yearly',         'Agency',            'White-label — yearly',              'subscription', 249900, 'EUR', 'year',  '{templates,strategy_builder,circle,agency}', 0, 31),

-- Standalone / Add-ons
('strategy_standalone',   'Strategy Builder',  '5 strategy credits — one-time',     'one_time',     19900,  'EUR', NULL,    '{strategy_builder}',                    5, 40),
('credit_pack_5',         'Strategy Credits',  '5 additional strategy credits',     'credit_pack',  9900,   'EUR', NULL,    '{}',                                    5, 50),
('consulting_session',    '1:1 With Gabriel',  'Direct consulting session',         'manual',       30000,  'EUR', NULL,    '{consulting}',                          0, 60),

-- Note: Agency tier gets unlimited credits — handled in application logic (unlimited=true flag)
-- Note: stripe_product_id and stripe_price_id must be set after creating products in Stripe

('templates_strategy_yearly', 'Templates + Strategy', 'Bundle — yearly', 'subscription', 44900, 'EUR', 'year', '{templates,strategy_builder}', 5, 15);

-- ============================================================================
-- TRIGGERS
-- ============================================================================
CREATE TRIGGER update_user_entitlements_updated_at
  BEFORE UPDATE ON public.user_entitlements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_strategy_credits_updated_at
  BEFORE UPDATE ON public.strategy_credits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
