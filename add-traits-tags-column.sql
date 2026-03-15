-- Migration: add tags array and deleted_at to traits table
-- Run this once in your Supabase SQL editor.

ALTER TABLE public.traits
  ADD COLUMN IF NOT EXISTS tags        TEXT[]    NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ;

-- Index for fast tag containment queries (@>)
CREATE INDEX IF NOT EXISTS idx_traits_tags
  ON public.traits USING GIN (tags);

-- Index for soft-delete filtering
CREATE INDEX IF NOT EXISTS idx_traits_deleted_at
  ON public.traits (deleted_at)
  WHERE deleted_at IS NULL;
