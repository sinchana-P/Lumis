-- Migration: add missing columns to incidents table
-- Run once in your Supabase SQL editor.

ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS category    TEXT,         -- conflict | breakthrough | milestone | challenge | celebration
  ADD COLUMN IF NOT EXISTS severity    TEXT,         -- low | medium | high
  ADD COLUMN IF NOT EXISTS outcome     TEXT,         -- resolution / reflection
  ADD COLUMN IF NOT EXISTS tags        TEXT[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ;

-- GIN index for fast tag search
CREATE INDEX IF NOT EXISTS idx_incidents_tags
  ON public.incidents USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_incidents_deleted_at
  ON public.incidents (deleted_at)
  WHERE deleted_at IS NULL;
