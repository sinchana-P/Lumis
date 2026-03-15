-- Migration: add missing columns to patterns table
-- Run in Supabase SQL editor

-- Give pattern_type a default so new rows don't violate NOT NULL
ALTER TABLE patterns ALTER COLUMN pattern_type SET DEFAULT 'behavioral';

ALTER TABLE patterns
  ADD COLUMN IF NOT EXISTS category       TEXT CHECK (category IN ('communication','conflict','affection','decision-making','stress-response','social')),
  ADD COLUMN IF NOT EXISTS frequency      TEXT CHECK (frequency IN ('rare','occasional','frequent','constant')),
  ADD COLUMN IF NOT EXISTS impact         TEXT CHECK (impact IN ('positive','neutral','negative')),
  ADD COLUMN IF NOT EXISTS triggers       TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS examples       TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tags           TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS deleted_at     TIMESTAMPTZ;

-- GIN index for tag array containment queries
CREATE INDEX IF NOT EXISTS idx_patterns_tags     ON patterns USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_patterns_triggers ON patterns USING GIN (triggers);

-- Index for soft-delete filtering
CREATE INDEX IF NOT EXISTS idx_patterns_deleted_at ON patterns (deleted_at) WHERE deleted_at IS NULL;
