-- Add banner campaign columns to franchise_locations
ALTER TABLE public.franchise_locations
ADD COLUMN IF NOT EXISTS banner_campaign TEXT NOT NULL DEFAULT 'legionarios',
ADD COLUMN IF NOT EXISTS banner_title TEXT,
ADD COLUMN IF NOT EXISTS banner_subtitle TEXT;
