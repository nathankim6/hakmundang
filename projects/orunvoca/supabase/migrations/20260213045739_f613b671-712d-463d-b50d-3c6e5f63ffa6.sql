-- Create word_images table to cache generated images
CREATE TABLE public.word_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL,
  card_set_id UUID,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(word, card_set_id)
);

-- Enable RLS
ALTER TABLE public.word_images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Word images are viewable by everyone"
ON public.word_images
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create word images"
ON public.word_images
FOR INSERT
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_word_images_word_card_set ON public.word_images(word, card_set_id);