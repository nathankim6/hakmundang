-- Create storage bucket for course images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('course-images', 'course-images', true);

-- Create storage policies for course images
CREATE POLICY "Allow public access to course images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'course-images');

CREATE POLICY "Allow authenticated users to upload course images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'course-images');

CREATE POLICY "Allow authenticated users to update course images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'course-images');

CREATE POLICY "Allow authenticated users to delete course images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'course-images');