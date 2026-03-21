-- Advertising Unplugged - Supabase Storage Configuration
-- Sets up buckets and RLS policies for file storage

-- ============================================================================
-- CREATE STORAGE BUCKETS
-- ============================================================================

-- Brand Assets Bucket: For user-uploaded brand materials
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'brand-assets',
  'brand-assets',
  false,
  52428800, -- 50MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf', 'application/zip']
)
ON CONFLICT (id) DO NOTHING;

-- Strategy Exports Bucket: For generated PDF strategy documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'strategy-exports',
  'strategy-exports',
  false,
  104857600, -- 100MB max file size
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Profile Images Bucket: For user avatars and community profiles
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true, -- Public read access for profile images
  10485760, -- 10MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- BRAND ASSETS BUCKET POLICIES
-- ============================================================================

-- Brand Assets: Users can upload their own brand materials
CREATE POLICY "Users can upload their own brand assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'brand-assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Brand Assets: Users can view their own brand materials
CREATE POLICY "Users can view their own brand assets"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'brand-assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Brand Assets: Users can update their own brand materials (metadata)
CREATE POLICY "Users can update their own brand assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'brand-assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'brand-assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Brand Assets: Users can delete their own brand materials
CREATE POLICY "Users can delete their own brand assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'brand-assets' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- STRATEGY EXPORTS BUCKET POLICIES
-- ============================================================================

-- Strategy Exports: Users can upload their own exports
CREATE POLICY "Users can upload their own strategy exports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'strategy-exports' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Strategy Exports: Users can view their own exports
CREATE POLICY "Users can view their own strategy exports"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'strategy-exports' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Strategy Exports: System can upload (for automatic PDF generation)
CREATE POLICY "System can upload strategy exports"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'strategy-exports');

-- Strategy Exports: System can update exports
CREATE POLICY "System can update strategy exports"
ON storage.objects FOR UPDATE
TO service_role
USING (bucket_id = 'strategy-exports')
WITH CHECK (bucket_id = 'strategy-exports');

-- Strategy Exports: Users can delete their own exports
CREATE POLICY "Users can delete their own strategy exports"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'strategy-exports' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- PROFILE IMAGES BUCKET POLICIES
-- ============================================================================

-- Profile Images: Users can upload their own profile images
CREATE POLICY "Users can upload their own profile images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Profile Images: Anyone can view profile images (public bucket)
CREATE POLICY "Anyone can view profile images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- Profile Images: Users can update their own profile images
CREATE POLICY "Users can update their own profile images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'profile-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Profile Images: Users can delete their own profile images
CREATE POLICY "Users can delete their own profile images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- NOTE: Indexes on storage.objects are managed by Supabase and cannot be
-- modified by user migrations. The default indexes are sufficient.

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- Storage Path Structure:
-- - brand-assets/{user_id}/{filename}
-- - strategy-exports/{user_id}/{strategy_id}/{filename}
-- - profile-images/{user_id}/avatar.{ext}
--
-- File Naming Conventions:
-- - Use UUIDs for generated files
-- - Sanitize user-provided filenames
-- - Include timestamp in generated files: {purpose}-{timestamp}.{ext}
--
-- Size Limits:
-- - Brand assets: 50MB (logos, brand guidelines, competitor refs)
-- - Strategy exports: 100MB (large PDF reports with visuals)
-- - Profile images: 10MB (should be much smaller, ~1-2MB)
--
-- MIME Types Allowed:
-- - Images: jpeg, png, webp, svg
-- - Documents: pdf, docx
-- - Archives: zip (for bulk uploads)
--
