-- Migration: Replace generic questionnaire with Gabriel's 39 strategic questions
-- This migration clears all existing questionnaire data and inserts the correct sections and questions.

BEGIN;

-- 1. Clear existing data (questions first due to FK constraint)
DELETE FROM public.questionnaire_questions;
DELETE FROM public.questionnaire_sections;

-- 2. Insert the 7 sections
INSERT INTO public.questionnaire_sections (id, section_number, section_name, section_description, question_count) VALUES
  (gen_random_uuid(), 1, 'Brand Foundation', 'Understanding the origin, purpose, and core identity of your brand.', 6),
  (gen_random_uuid(), 2, 'Consumer Insights', 'Deep dive into consumer needs, frustrations, and information-seeking behavior.', 5),
  (gen_random_uuid(), 3, 'Product & Credibility', 'Evaluating product uniqueness, credibility evidence, and brand promises.', 5),
  (gen_random_uuid(), 4, 'Competitive Landscape', 'Mapping your competitive environment, differentiators, and market trends.', 4),
  (gen_random_uuid(), 5, 'Brand Personality', 'Defining the human characteristics, archetype, and emotional dimension of your brand.', 7),
  (gen_random_uuid(), 6, 'Customer Journey', 'Mapping the path from awareness to purchase and identifying key moments.', 5),
  (gen_random_uuid(), 7, 'Vision & Growth', 'Long-term brand vision, evolution direction, and growth triggers.', 7);

-- 3. Insert all 39 questions
-- Section A: Brand Foundation (Q1-6)
INSERT INTO public.questionnaire_questions (id, section_id, question_number, question_text, question_type, required, help_text, placeholder, options) VALUES
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 1), 1,
   'What was the real reason you created [BRAND]?', 'textarea', true, NULL, NULL, NULL),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 1), 2,
   'What major market problem do you intend to solve?', 'textarea', true, NULL, NULL, NULL),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 1), 3,
   'How is [BRAND] different from the rest of the players?', 'textarea', true, NULL, NULL, NULL),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 1), 4,
   'What are the 3 core values of the [BRAND] brand?', 'textarea', true, NULL, NULL, NULL),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 1), 5,
   'If [BRAND] ceased to exist tomorrow, what would consumers lose?', 'textarea', true, NULL, NULL, NULL),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 1), 6,
   'How would you describe the ideal consumer of the [BRAND] brand?', 'textarea', true, NULL, NULL, NULL);

-- Section B: Consumer Insights (Q7-11)
INSERT INTO public.questionnaire_questions (id, section_id, question_number, question_text, question_type, required, help_text, placeholder, options) VALUES
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 2), 7,
   'What need, frustration or major difficulty do your products solve?', 'textarea', true, NULL, NULL, NULL),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 2), 8,
   'What are people''s biggest barriers regarding [CATEGORY]?', 'textarea', true, NULL, NULL, NULL),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 2), 9,
   'What type of information do consumers seek before buying?', 'textarea', true, NULL, NULL, NULL),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 2), 10,
   'What is the usual information-seeking behavior of consumers?', 'textarea', true, NULL, NULL, NULL),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 2), 11,
   'What are [BRAND]''s hero products?', 'textarea', true, NULL, NULL, NULL);

-- Section C: Product & Credibility (Q12-16)
INSERT INTO public.questionnaire_questions (id, section_id, question_number, question_text, question_type, required, help_text, placeholder, options) VALUES
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 3), 12,
   'What elements in product formulation are truly unique?', 'textarea', true, NULL, NULL, NULL),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 3), 13,
   'What clear evidence can we use to strengthen credibility?', 'textarea', true, NULL, NULL, NULL),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 3), 14,
   'Are there production aspects that competition cannot copy?', 'textarea', false, NULL, NULL, NULL),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 3), 15,
   'What promises should [BRAND] NEVER make?', 'textarea', true, NULL, NULL, NULL),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 3), 16,
   'Who are the relevant direct and indirect competitors?', 'textarea', true, 'Include website URLs and social media links', NULL, NULL);

-- Section D: Competitive Landscape (Q17-20)
INSERT INTO public.questionnaire_questions (id, section_id, question_number, question_text, question_type, required, help_text, placeholder, options) VALUES
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 4), 17,
   'What concretely differentiates [BRAND] from these competitors?', 'textarea', true, NULL, NULL, NULL),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 4), 18,
   'What do competitors do well that [BRAND] can learn from?', 'textarea', true, NULL, NULL, NULL),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 4), 19,
   'What do competitors do wrong that should be avoided?', 'textarea', false, NULL, NULL, NULL),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 4), 20,
   'What trends do you observe in the [CATEGORY] market?', 'textarea', true, NULL, NULL, NULL);

-- Section E: Brand Personality (Q21-27)
INSERT INTO public.questionnaire_questions (id, section_id, question_number, question_text, question_type, required, help_text, placeholder, options) VALUES
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 5), 21,
   'If [BRAND] were a person, what 3-5 adjectives would describe them?', 'textarea', true, NULL, NULL, NULL),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 5), 22,
   'What primary emotion do we want the brand to convey?', 'text', true, NULL, NULL, NULL),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 5), 23,
   'What type of tone of voice do you consider appropriate?', 'textarea', true, NULL, NULL, NULL),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 5), 24,
   'Which Jungian archetype best represents [BRAND]?', 'select', true, NULL, NULL,
   '["The Hero", "The Sage", "The Innocent", "The Lover", "The Creator", "The Caregiver", "The Everyman", "The Jester", "The Magician", "The Outlaw", "The Explorer", "The Ruler"]'::jsonb),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 5), 25,
   'What archetype does NOT fit the brand at all?', 'select', true, NULL, NULL,
   '["The Hero", "The Sage", "The Innocent", "The Lover", "The Creator", "The Caregiver", "The Everyman", "The Jester", "The Magician", "The Outlaw", "The Explorer", "The Ruler"]'::jsonb),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 5), 26,
   'What emotional reaction should the brand trigger?', 'textarea', true, NULL, NULL, NULL),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 5), 27,
   'Please provide 3-5 real examples of Jobs-To-Be-Done', 'textarea', true, 'Format: When I [situation], I want [motivation] so that [expected outcome]', NULL, NULL);

-- Section F: Customer Journey (Q28-32)
INSERT INTO public.questionnaire_questions (id, section_id, question_number, question_text, question_type, required, help_text, placeholder, options) VALUES
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 6), 28,
   'What is the typical path from need to purchase?', 'textarea', true, NULL, NULL, NULL),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 6), 29,
   'Where are potential customers most often lost?', 'textarea', true, NULL, NULL, NULL),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 6), 30,
   'What convinces them most to complete the purchase?', 'textarea', true, NULL, NULL, NULL),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 6), 31,
   'What type of message works best in the awareness stage?', 'textarea', false, NULL, NULL, NULL),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 6), 32,
   'At what life moments do people most often think about [CATEGORY]?', 'textarea', true, NULL, NULL, NULL);

-- Section G: Vision & Growth (Q33-39)
INSERT INTO public.questionnaire_questions (id, section_id, question_number, question_text, question_type, required, help_text, placeholder, options) VALUES
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 7), 33,
   'Where do you see [BRAND] in 3 years?', 'textarea', true, NULL, NULL, NULL),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 7), 34,
   'In what direction do you want the brand to evolve?', 'textarea', true, NULL, NULL, NULL),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 7), 35,
   'If budget were not a limit, what would you immediately change about the brand?', 'textarea', false, NULL, NULL, NULL),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 7), 36,
   'What would you like consumers to say about [BRAND] in 5 years?', 'textarea', true, NULL, NULL, NULL),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 7), 37,
   'What events or changes trigger interest in products?', 'textarea', false, NULL, NULL, NULL),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 7), 38,
   'When are people most receptive to brand messages?', 'textarea', false, NULL, NULL, NULL),
  (gen_random_uuid(), (SELECT id FROM public.questionnaire_sections WHERE section_number = 7), 39,
   '[OPEN] Is there anything else you consider important that hasn''t been covered?', 'textarea', false, NULL, NULL, NULL);

COMMIT;
