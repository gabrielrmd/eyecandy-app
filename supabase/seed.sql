-- Advertising Unplugged - Seed Data
-- Includes templates, questionnaire structure, pricing, and challenge setup

-- ============================================================================
-- QUESTIONNAIRE SECTIONS (7 sections, 39 questions total)
-- ============================================================================

INSERT INTO public.questionnaire_sections (section_number, section_name, section_description, question_count) VALUES
(1, 'Business Foundation', 'Understanding your business fundamentals', 6),
(2, 'Target Audience', 'Defining and understanding your ideal customers', 6),
(3, 'Competitive Landscape', 'Analyzing your market position', 6),
(4, 'Value Proposition', 'Clarifying your unique value and messaging', 6),
(5, 'Marketing Goals & Metrics', 'Setting objectives and KPIs', 6),
(6, 'Current Challenges & Gaps', 'Identifying pain points in marketing', 6),
(7, 'Future Vision & Growth', 'Planning your strategic direction', 3);

-- ============================================================================
-- QUESTIONNAIRE QUESTIONS (39 total)
-- ============================================================================

-- Section 1: Business Foundation (Questions 1-6)
INSERT INTO public.questionnaire_questions (section_id, question_number, question_text, question_type, required, help_text, placeholder, options) VALUES
((SELECT id FROM public.questionnaire_sections WHERE section_number = 1), 1, 'What is your company/brand name?', 'text', true, 'Enter your official business name', 'e.g., Acme Corp', NULL),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 1), 2, 'What industry/sector are you in?', 'select', true, 'Choose the industry that best describes your business', NULL, '["Technology", "Healthcare", "Finance", "Retail", "Manufacturing", "Services", "Education", "Other"]'::jsonb),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 1), 3, 'How long has your business been operating?', 'select', true, 'Select your company age', NULL, '[{"label": "Less than 1 year", "value": "0-1"}, {"label": "1-3 years", "value": "1-3"}, {"label": "3-5 years", "value": "3-5"}, {"label": "5-10 years", "value": "5-10"}, {"label": "10+ years", "value": "10+"}]'::jsonb),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 1), 4, 'What is your approximate annual revenue?', 'select', false, 'Optional - helps tailor recommendations', NULL, '[{"label": "Under €100K", "value": "<100k"}, {"label": "€100K-€500K", "value": "100k-500k"}, {"label": "€500K-€1M", "value": "500k-1m"}, {"label": "€1M-€5M", "value": "1m-5m"}, {"label": "€5M-€10M", "value": "5m-10m"}, {"label": "€10M+", "value": "10m+"}, {"label": "Prefer not to say", "value": "private"}]'::jsonb),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 1), 5, 'How many employees do you have?', 'select', true, 'Select your team size', NULL, '[{"label": "1-5", "value": "1-5"}, {"label": "6-20", "value": "6-20"}, {"label": "21-50", "value": "21-50"}, {"label": "51-100", "value": "51-100"}, {"label": "101-500", "value": "101-500"}, {"label": "500+", "value": "500+"}]'::jsonb),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 1), 6, 'What is your main business model?', 'multiselect', true, 'Select all that apply', NULL, '[{"label": "B2B (Business-to-Business)", "value": "b2b"}, {"label": "B2C (Business-to-Consumer)", "value": "b2c"}, {"label": "B2B2C", "value": "b2b2c"}, {"label": "SaaS/Subscription", "value": "saas"}, {"label": "E-commerce", "value": "ecommerce"}, {"label": "Service-based", "value": "services"}, {"label": "Hybrid/Multiple", "value": "hybrid"}]'::jsonb);

-- Section 2: Target Audience (Questions 7-12)
INSERT INTO public.questionnaire_questions (section_id, question_number, question_text, question_type, required, help_text, placeholder, options) VALUES
((SELECT id FROM public.questionnaire_sections WHERE section_number = 2), 7, 'Who is your primary target audience/customer?', 'textarea', true, 'Describe your ideal customer in detail. Include demographics, psychographics, and pain points', 'e.g., Marketing managers at tech startups, aged 28-40, seeking to scale growth...', NULL),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 2), 8, 'What are the key pain points your target audience faces?', 'textarea', true, 'What problems do your customers struggle with?', 'e.g., Limited budget, too many tools to manage, difficulty measuring ROI...', NULL),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 2), 9, 'How do you currently acquire customers?', 'multiselect', true, 'Select all current acquisition channels', NULL, '[{"label": "Organic Search (SEO)", "value": "seo"}, {"label": "Paid Search (PPC)", "value": "ppc"}, {"label": "Social Media", "value": "social"}, {"label": "Email Marketing", "value": "email"}, {"label": "Content Marketing", "value": "content"}, {"label": "Referrals", "value": "referrals"}, {"label": "Partnerships", "value": "partnerships"}, {"label": "Direct Sales", "value": "sales"}, {"label": "Events/Webinars", "value": "events"}, {"label": "PR/Media", "value": "pr"}]'::jsonb),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 2), 10, 'What is your customer acquisition cost (CAC)?', 'text', false, 'Approximate cost per customer or estimated range', 'e.g., €50-150 per customer', NULL),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 2), 11, 'What is your customer lifetime value (LTV)?', 'text', false, 'Approximate total value per customer over lifetime', 'e.g., €5000-15000', NULL),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 2), 12, 'What is your target market size/TAM?', 'textarea', false, 'Estimate your Total Addressable Market', 'e.g., €500M globally, €50M in Europe...', NULL);

-- Section 3: Competitive Landscape (Questions 13-18)
INSERT INTO public.questionnaire_questions (section_id, question_number, question_text, question_type, required, help_text, placeholder, options) VALUES
((SELECT id FROM public.questionnaire_sections WHERE section_number = 3), 13, 'Who are your top 3 competitors?', 'textarea', true, 'List and briefly describe your main competitors', 'e.g., Competitor A (focuses on enterprise, premium pricing), Competitor B...', NULL),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 3), 14, 'What are their main strengths?', 'textarea', true, 'What do competitors do well?', 'e.g., Strong brand recognition, excellent customer service, lower prices...', NULL),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 3), 15, 'What are their main weaknesses?', 'textarea', true, 'Where do competitors fall short?', 'e.g., Poor UX, expensive, lacks support, limited features...', NULL),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 3), 16, 'How do you differentiate from competitors?', 'textarea', true, 'What makes you unique and different?', 'e.g., Superior product quality, better customer support, lower cost...', NULL),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 3), 17, 'What is your market position?', 'select', true, 'Where do you sit in the market?', NULL, '[{"label": "Market Leader/Incumbent", "value": "leader"}, {"label": "Strong Challenger", "value": "challenger"}, {"label": "Niche Player", "value": "niche"}, {"label": "New Entrant/Disruptor", "value": "new"}, {"label": "Uncertain", "value": "unknown"}]'::jsonb),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 3), 18, 'What competitive advantages are hardest to replicate?', 'textarea', false, 'Your moats or defensible assets', 'e.g., Proprietary technology, network effects, brand loyalty, patents...', NULL);

-- Section 4: Value Proposition (Questions 19-24)
INSERT INTO public.questionnaire_questions (section_id, question_number, question_text, question_type, required, help_text, placeholder, options) VALUES
((SELECT id FROM public.questionnaire_sections WHERE section_number = 4), 19, 'What is your core value proposition?', 'textarea', true, 'The main benefit/value you deliver. Keep it concise.', 'e.g., Save 10 hours/week on marketing tasks through AI automation', NULL),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 4), 20, 'What specific problems does your product/service solve?', 'textarea', true, 'List the key problems you address', 'e.g., Reduces marketing team time, improves campaign ROI, ensures brand consistency...', NULL),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 4), 21, 'What measurable results do customers achieve?', 'textarea', true, 'Quantifiable outcomes from using your solution', 'e.g., 40% increase in conversion rate, 25% cost reduction, 50% faster campaign launch...', NULL),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 4), 22, 'What is your key brand message/positioning?', 'textarea', true, 'How you want to be perceived in the market', 'e.g., "The intelligent alternative to traditional agencies"', NULL),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 4), 23, 'What tone/personality should your brand communicate?', 'multiselect', true, 'Brand voice characteristics', NULL, '[{"label": "Professional/Corporate", "value": "professional"}, {"label": "Friendly/Approachable", "value": "friendly"}, {"label": "Innovative/Cutting-edge", "value": "innovative"}, {"label": "Educational/Helpful", "value": "educational"}, {"label": "Bold/Disruptive", "value": "bold"}, {"label": "Luxury/Premium", "value": "luxury"}, {"label": "Playful/Fun", "value": "playful"}]'::jsonb),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 4), 24, 'What are your top 3 key features or benefits?', 'textarea', true, 'Your most important differentiators', 'e.g., 1. AI-powered personalization, 2. One-click deployment, 3. Real-time analytics...', NULL);

-- Section 5: Marketing Goals & Metrics (Questions 25-30)
INSERT INTO public.questionnaire_questions (section_id, question_number, question_text, question_type, required, help_text, placeholder, options) VALUES
((SELECT id FROM public.questionnaire_sections WHERE section_number = 5), 25, 'What is your #1 marketing goal for the next 12 months?', 'textarea', true, 'Your primary objective', 'e.g., Increase brand awareness, grow customer base by 50%, launch new product...', NULL),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 5), 26, 'What is your revenue goal for next year?', 'text', false, 'Target annual revenue or growth percentage', 'e.g., €2M ARR or 100% growth', NULL),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 5), 27, 'What are your top 3 key performance indicators (KPIs)?', 'textarea', true, 'The metrics that matter most to your business', 'e.g., Customer acquisition cost, annual recurring revenue, customer lifetime value...', NULL),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 5), 28, 'What is your marketing budget for the next 12 months?', 'text', false, 'Annual marketing spend or percentage of revenue', 'e.g., €50K or 10% of revenue', NULL),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 5), 29, 'What marketing initiatives are currently underway?', 'textarea', false, 'Current campaigns, projects, or focuses', 'e.g., SEO optimization, LinkedIn lead generation, product launch campaign...', NULL),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 5), 30, 'What is your expected customer retention/churn rate?', 'text', false, 'Estimated percentage or timeframe', 'e.g., 90% annual retention or 3% monthly churn', NULL);

-- Section 6: Current Challenges & Gaps (Questions 31-36)
INSERT INTO public.questionnaire_questions (section_id, question_number, question_text, question_type, required, help_text, placeholder, options) VALUES
((SELECT id FROM public.questionnaire_sections WHERE section_number = 6), 31, 'What is your biggest marketing challenge right now?', 'textarea', true, 'Your most pressing pain point', 'e.g., Difficulty generating qualified leads, poor content performance, lack of resources...', NULL),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 6), 32, 'What is holding you back from achieving your goals?', 'multiselect', true, 'Main obstacles/barriers', NULL, '[{"label": "Limited budget", "value": "budget"}, {"label": "Lack of team/expertise", "value": "team"}, {"label": "Unclear strategy", "value": "strategy"}, {"label": "Technology gaps", "value": "tech"}, {"label": "Limited data/analytics", "value": "data"}, {"label": "Poor brand awareness", "value": "awareness"}, {"label": "Competition", "value": "competition"}, {"label": "Uncertain market fit", "value": "fit"}, {"label": "Other", "value": "other"}]'::jsonb),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 6), 33, 'What marketing skills/expertise do you lack?', 'multiselect', false, 'Areas where you need support', NULL, '[{"label": "Content Marketing", "value": "content"}, {"label": "Data Analytics", "value": "analytics"}, {"label": "Paid Advertising", "value": "paid"}, {"label": "Social Media", "value": "social"}, {"label": "SEO", "value": "seo"}, {"label": "Email Marketing", "value": "email"}, {"label": "Video Marketing", "value": "video"}, {"label": "Brand Strategy", "value": "strategy"}, {"label": "Sales Alignment", "value": "sales"}]'::jsonb),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 6), 34, 'How satisfied are you with your current marketing performance?', 'scale', true, 'Rate your current results (1-10)', NULL, '{"scale_min": 1, "scale_max": 10, "scale_min_label": "Very Unsatisfied", "scale_max_label": "Very Satisfied"}'::jsonb),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 6), 35, 'What has worked well in your marketing so far?', 'textarea', false, 'Your past successes and wins', 'e.g., Content marketing brought 40% of leads, LinkedIn outreach was effective...', NULL),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 6), 36, 'What has not worked or failed?', 'textarea', false, 'Past initiatives that underperformed', 'e.g., Paid Facebook ads were too expensive, email campaigns had low open rates...', NULL);

-- Section 7: Future Vision & Growth (Questions 37-39)
INSERT INTO public.questionnaire_questions (section_id, question_number, question_text, question_type, required, help_text, placeholder, options) VALUES
((SELECT id FROM public.questionnaire_sections WHERE section_number = 7), 37, 'Where do you see your business in 3 years?', 'textarea', true, 'Your vision and strategic direction', 'e.g., Market leader in our vertical with 50k customers, acquired by larger company...', NULL),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 7), 38, 'What is your biggest growth opportunity?', 'textarea', true, 'Your best avenue for rapid growth', 'e.g., Expanding to new markets, new product lines, strategic partnership...', NULL),
((SELECT id FROM public.questionnaire_sections WHERE section_number = 7), 39, 'How can we best help you achieve your goals?', 'textarea', true, 'What support or expertise would be most valuable?', 'e.g., Help develop comprehensive marketing strategy, improve content, optimize sales funnel...', NULL);

-- ============================================================================
-- TEMPLATE CATALOG (41 interactive marketing templates)
-- ============================================================================

INSERT INTO public.template_catalog (name, slug, category, description, min_plan, difficulty_level, featured) VALUES
-- Brand & Positioning (6 templates)
('Brand Positioning Canvas', 'brand-positioning-canvas', 'Brand & Positioning', 'Define your brand''s unique position in the market', 'starter', 'beginner', true),
('Brand Voice & Tone Guide', 'brand-voice-guide', 'Brand & Positioning', 'Establish consistent messaging across all channels', 'starter', 'beginner', false),
('Brand Architecture Template', 'brand-architecture', 'Brand & Positioning', 'Map your product/service portfolio and brand relationships', 'professional', 'intermediate', false),
('Mission, Vision & Values', 'mission-vision-values', 'Brand & Positioning', 'Define your company''s core purpose and values', 'free', 'beginner', true),
('Elevator Pitch Generator', 'elevator-pitch', 'Brand & Positioning', 'Craft compelling 30-60 second pitches', 'starter', 'beginner', false),
('Brand Audit Checklist', 'brand-audit', 'Brand & Positioning', 'Evaluate your current brand across all touchpoints', 'professional', 'intermediate', false),

-- Content Strategy (7 templates)
('Content Calendar Planner', 'content-calendar', 'Content Strategy', 'Plan and organize your content across channels and months', 'starter', 'beginner', true),
('Content Pillars & Topics', 'content-pillars', 'Content Strategy', 'Organize your content into strategic themes', 'starter', 'beginner', false),
('Blog Post Planner', 'blog-post-planner', 'Content Strategy', 'Structure and plan individual blog posts', 'free', 'beginner', false),
('Video Content Brief', 'video-brief', 'Content Strategy', 'Plan and brief video content production', 'starter', 'intermediate', false),
('Social Media Content Themes', 'social-themes', 'Content Strategy', 'Organize social media content strategy by themes', 'free', 'beginner', true),
('Email Campaign Blueprint', 'email-blueprint', 'Content Strategy', 'Design complete email marketing campaigns', 'starter', 'intermediate', false),
('Content Repurposing Plan', 'content-repurposing', 'Content Strategy', 'Maximize content value through repurposing', 'professional', 'intermediate', false),

-- Campaign Planning (6 templates)
('Campaign Brief Template', 'campaign-brief', 'Campaign Planning', 'Create detailed briefs for marketing campaigns', 'starter', 'beginner', true),
('Go-to-Market Strategy', 'gtm-strategy', 'Campaign Planning', 'Plan comprehensive launch and promotional campaigns', 'professional', 'intermediate', true),
('Paid Ad Campaign Planner', 'paid-ads-planner', 'Campaign Planning', 'Structure paid search and social campaigns', 'starter', 'intermediate', false),
('Influencer Campaign Plan', 'influencer-campaign', 'Campaign Planning', 'Plan influencer partnership campaigns', 'starter', 'intermediate', false),
('Event Marketing Plan', 'event-plan', 'Campaign Planning', 'Plan virtual or in-person marketing events', 'professional', 'intermediate', false),
('Seasonal Campaign Calendar', 'seasonal-calendar', 'Campaign Planning', 'Plan campaigns around holidays and seasons', 'starter', 'beginner', false),

-- Customer & Market Analysis (7 templates)
('Customer Persona Template', 'customer-persona', 'Customer & Market Analysis', 'Create detailed buyer personas for targeting', 'free', 'beginner', true),
('Customer Journey Map', 'customer-journey', 'Customer & Market Analysis', 'Visualize the complete customer experience', 'professional', 'intermediate', true),
('Market Research Summary', 'market-research', 'Customer & Market Analysis', 'Compile and analyze market research findings', 'professional', 'intermediate', false),
('Competitive Analysis Matrix', 'competitive-matrix', 'Customer & Market Analysis', 'Compare your business against competitors', 'starter', 'intermediate', true),
('Value Proposition Canvas', 'value-prop-canvas', 'Customer & Market Analysis', 'Map products to customer needs and desires', 'starter', 'intermediate', false),
('Customer Interview Guide', 'customer-interview', 'Customer & Market Analysis', 'Conduct effective customer discovery interviews', 'free', 'beginner', false),
('SWOT Analysis Template', 'swot-analysis', 'Customer & Market Analysis', 'Analyze your strengths, weaknesses, opportunities, threats', 'free', 'beginner', true),

-- Digital & Social Strategy (8 templates)
('Social Media Strategy', 'social-strategy', 'Digital & Social Strategy', 'Develop comprehensive social media approach', 'starter', 'intermediate', true),
('Website Audit & Improvement Plan', 'website-audit', 'Digital & Social Strategy', 'Evaluate and optimize website performance', 'professional', 'intermediate', false),
('SEO Strategy & Roadmap', 'seo-strategy', 'Digital & Social Strategy', 'Plan SEO efforts and track rankings', 'professional', 'intermediate', false),
('Email List Building Strategy', 'email-growth', 'Digital & Social Strategy', 'Grow your email subscriber base', 'starter', 'beginner', false),
('Marketing Funnel Optimization', 'funnel-optimization', 'Digital & Social Strategy', 'Improve conversions at each stage of funnel', 'professional', 'intermediate', true),
('Landing Page Worksheet', 'landing-page', 'Digital & Social Strategy', 'Design high-converting landing pages', 'starter', 'intermediate', false),
('LinkedIn Strategy & Content Plan', 'linkedin-strategy', 'Digital & Social Strategy', 'Build LinkedIn presence and engagement', 'starter', 'beginner', false),
('Marketing Tech Stack Evaluation', 'martech-stack', 'Digital & Social Strategy', 'Evaluate and optimize marketing tools and integrations', 'professional', 'intermediate', false),

-- Sales Alignment (2 templates)
('Sales & Marketing Alignment Plan', 'sales-alignment', 'Sales Alignment', 'Align marketing and sales teams and messaging', 'professional', 'intermediate', true),
('Sales Collateral Checklist', 'sales-collateral', 'Sales Alignment', 'Plan and create sales support materials', 'starter', 'beginner', false),

-- Analytics & Reporting (3 templates)
('Marketing Dashboard Template', 'marketing-dashboard', 'Analytics & Reporting', 'Track KPIs and campaign performance', 'professional', 'intermediate', true),
('Monthly Marketing Report', 'monthly-report', 'Analytics & Reporting', 'Report on marketing performance and metrics', 'starter', 'beginner', false),
('Attribution Model Setup', 'attribution-model', 'Analytics & Reporting', 'Define how to attribute revenue to channels', 'enterprise', 'advanced', false),

-- General Strategy (2 templates)
('Marketing Strategy Overview', 'marketing-strategy-overview', 'General Strategy', 'High-level annual marketing strategy document', 'starter', 'intermediate', true),
('Annual Marketing Plan', 'annual-plan', 'General Strategy', 'Comprehensive year-long marketing plan', 'professional', 'intermediate', false);

-- ============================================================================
-- CHALLENGE WEEKS (90-Day Growth Challenge - 12 weeks)
-- ============================================================================

INSERT INTO public.challenge_weeks (week_number, title, description, learning_objectives, resources, assignment) VALUES
(1, 'Strategy Foundation', 'Build a solid foundation for your growth strategy',
  ARRAY['Define your target audience', 'Identify your unique value proposition', 'Establish baseline metrics'],
  '[{"title": "Target Audience Guide", "url": "https://example.com/guide/target-audience", "type": "guide"}, {"title": "Value Prop Workshop", "url": "https://example.com/workshops/value-prop", "type": "video"}]'::jsonb,
  '{"title": "Complete Target Audience Persona", "description": "Create a detailed persona of your ideal customer including demographics, pain points, and goals", "submission_format": "PDF or written document"}'::jsonb),

(2, 'Brand Positioning', 'Position your brand distinctly in the market',
  ARRAY['Articulate brand positioning', 'Develop brand messaging', 'Create brand guidelines'],
  '[{"title": "Brand Positioning Template", "url": "https://example.com/templates/positioning", "type": "template"}, {"title": "Messaging Framework Video", "url": "https://example.com/videos/messaging", "type": "video"}]'::jsonb,
  '{"title": "Brand Positioning Statement", "description": "Write your brand positioning statement and key messages (max 2 pages)", "submission_format": "Document or presentation"}'::jsonb),

(3, 'Competitive Analysis', 'Understand your competitive landscape',
  ARRAY['Research competitors', 'Identify competitive advantages', 'Find market gaps'],
  '[{"title": "Competitive Analysis Template", "url": "https://example.com/templates/competition", "type": "template"}]'::jsonb,
  '{"title": "Competitive Analysis Report", "description": "Research 3 main competitors and create comparative analysis", "submission_format": "Spreadsheet or document"}'::jsonb),

(4, 'Marketing Goal Setting', 'Define measurable, achievable goals',
  ARRAY['Set SMART goals', 'Define KPIs', 'Establish success metrics'],
  '[{"title": "SMART Goals Framework", "url": "https://example.com/guides/smart-goals", "type": "guide"}]'::jsonb,
  '{"title": "12-Month Marketing Goals & KPIs", "description": "Define 3-5 main marketing goals with associated KPIs and targets", "submission_format": "Document"}'::jsonb),

(5, 'Content Strategy Development', 'Build your content roadmap',
  ARRAY['Develop content themes', 'Plan content pillars', 'Create publishing schedule'],
  '[{"title": "Content Strategy Masterclass", "url": "https://example.com/masterclass/content", "type": "video"}, {"title": "Content Calendar Template", "url": "https://example.com/templates/calendar", "type": "template"}]'::jsonb,
  '{"title": "3-Month Content Calendar", "description": "Plan content across 3 months (blog, social, email) with specific topics and dates", "submission_format": "Spreadsheet"}'::jsonb),

(6, 'Audience Engagement Plan', 'Create strategy for reaching your audience',
  ARRAY['Identify communication channels', 'Plan engagement tactics', 'Build community strategy'],
  '[{"title": "Channel Strategy Guide", "url": "https://example.com/guides/channels", "type": "guide"}]'::jsonb,
  '{"title": "Go-to-Market Channel Plan", "description": "Choose 3-4 main channels and outline strategy for each (SEO, social, email, paid, etc.)", "submission_format": "Document or presentation"}'::jsonb),

(7, 'Sales & Marketing Alignment', 'Align sales and marketing efforts',
  ARRAY['Align messaging', 'Define leads and handoff', 'Create sales collateral'],
  '[{"title": "Sales Enablement Guide", "url": "https://example.com/guides/sales-enablement", "type": "guide"}]'::jsonb,
  '{"title": "Sales & Marketing Alignment Plan", "description": "Document how marketing and sales teams will work together, including lead definitions", "submission_format": "Document"}'::jsonb),

(8, 'Customer Experience Mapping', 'Optimize the complete customer journey',
  ARRAY['Map customer touchpoints', 'Identify friction points', 'Plan improvements'],
  '[{"title": "Customer Journey Mapping Workshop", "url": "https://example.com/workshops/cjm", "type": "video"}]'::jsonb,
  '{"title": "Customer Journey Map", "description": "Create detailed map of customer journey from awareness through advocacy", "submission_format": "Visual diagram or document"}'::jsonb),

(9, 'Conversion Optimization', 'Improve conversion rates across funnel',
  ARRAY['Audit conversion points', 'Identify optimization opportunities', 'Plan A/B tests'],
  '[{"title": "CRO Fundamentals", "url": "https://example.com/guides/cro", "type": "guide"}]'::jsonb,
  '{"title": "Conversion Optimization Plan", "description": "Identify top 5 conversion barriers and outline optimization tests and improvements", "submission_format": "Document"}'::jsonb),

(10, 'Analytics & Measurement', 'Set up proper tracking and reporting',
  ARRAY['Define measurement framework', 'Set up tracking', 'Create dashboards'],
  '[{"title": "Marketing Analytics Masterclass", "url": "https://example.com/masterclass/analytics", "type": "video"}]'::jsonb,
  '{"title": "Marketing Dashboard Setup", "description": "Create a template showing how you''ll track your KPIs and key metrics", "submission_format": "Spreadsheet or screenshot"}'::jsonb),

(11, 'Growth Experimentation', 'Plan rapid testing and iteration',
  ARRAY['Develop growth mindset', 'Plan experiments', 'Define success criteria'],
  '[{"title": "Growth Hacking Framework", "url": "https://example.com/guides/growth-hacking", "type": "guide"}]'::jsonb,
  '{"title": "Growth Experiment Plan", "description": "Design 3 specific growth experiments to test in next 30 days", "submission_format": "Document"}'::jsonb),

(12, 'Strategy Execution & Next Steps', 'Finalize and launch your strategy',
  ARRAY['Finalize strategy', 'Create action plan', 'Plan next quarter'],
  '[{"title": "Strategy Execution Checklist", "url": "https://example.com/checklists/execution", "type": "template"}]'::jsonb,
  '{"title": "90-Day Action Plan & Q2 Strategy", "description": "Create detailed action plan for implementing strategy and outline goals for next quarter", "submission_format": "Document or presentation"}'::jsonb);

-- ============================================================================
-- PRICING TIERS
-- ============================================================================

-- Note: These are metadata entries for reference in application code
-- Actual Stripe integration is handled via Stripe webhooks

-- Starter Plan: €149-299/month
-- Professional Plan: €499-799/month
-- Enterprise Plan: €1499-2999/month
-- Template Toolkit: €9-19/month
-- Free Plan: Limited templates and features

-- ============================================================================
-- COMMUNITY SETUP
-- ============================================================================

-- Wall of Fame tiers and achievement system will be managed through the
-- community_members table based on challenge completions and strategy usage
