-- Fix the card_set_id column type in card_assignments table to match card_sets.id
-- and establish proper foreign key relationship

-- First, update the card_set_id column type from text to uuid
ALTER TABLE public.card_assignments 
ALTER COLUMN card_set_id TYPE uuid USING card_set_id::uuid;

-- Add foreign key constraint between card_assignments and card_sets
ALTER TABLE public.card_assignments 
ADD CONSTRAINT card_assignments_card_set_id_fkey 
FOREIGN KEY (card_set_id) REFERENCES public.card_sets(id) ON DELETE CASCADE;