-- Create storage bucket for media assets (videos and images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('media_assets', 'media_assets', true, 104857600, ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']);

-- Create RLS policies for media assets bucket
CREATE POLICY "Media assets are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'media_assets');

CREATE POLICY "Anyone can upload media assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'media_assets');

CREATE POLICY "Anyone can update media assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'media_assets');

CREATE POLICY "Anyone can delete media assets" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'media_assets');