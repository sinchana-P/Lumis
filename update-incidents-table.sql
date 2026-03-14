-- ============================================
-- UPDATE INCIDENTS TABLE TO SUPPORT POSITIVE INCIDENTS
-- ============================================
-- Run this in Supabase SQL Editor to update the incidents table

-- Add incident_type column (positive, negative, neutral)
ALTER TABLE public.incidents 
ADD COLUMN IF NOT EXISTS incident_type TEXT NOT NULL DEFAULT 'negative';

-- Rename severity to intensity (more neutral term)
ALTER TABLE public.incidents 
RENAME COLUMN severity TO intensity;

-- Update the check constraint to use intensity
ALTER TABLE public.incidents 
DROP CONSTRAINT IF EXISTS incidents_severity_check;

ALTER TABLE public.incidents 
ADD CONSTRAINT incidents_intensity_check CHECK (intensity >= 1 AND intensity <= 5);

-- Add comment to clarify the table purpose
COMMENT ON TABLE public.incidents IS 'Significant events with members - can be positive, negative, or neutral';
COMMENT ON COLUMN public.incidents.incident_type IS 'Type of incident: positive, negative, or neutral';
COMMENT ON COLUMN public.incidents.intensity IS 'Impact intensity: 1=minor, 5=major impact';

-- ============================================
-- COMPLETE!
-- ============================================
-- The incidents table now supports positive, negative, and neutral events.
