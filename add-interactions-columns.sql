-- Migration: add missing columns to interactions table
-- Run in Supabase SQL editor

-- Widen energy_level to 1-10 (drop old constraint, add new one)
ALTER TABLE interactions DROP CONSTRAINT IF EXISTS interactions_energy_level_check;
ALTER TABLE interactions ADD CONSTRAINT interactions_energy_level_check CHECK (energy_level >= 1 AND energy_level <= 10);

ALTER TABLE interactions
  ADD COLUMN IF NOT EXISTS type        TEXT CHECK (type IN ('call','text','in-person','video','email','social')),
  ADD COLUMN IF NOT EXISTS duration    TEXT,
  ADD COLUMN IF NOT EXISTS quality     TEXT CHECK (quality IN ('excellent','good','neutral','poor','difficult')),
  ADD COLUMN IF NOT EXISTS topics      TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tags        TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMPTZ;

-- GIN index for array containment queries
CREATE INDEX IF NOT EXISTS idx_interactions_topics     ON interactions USING GIN (topics);
CREATE INDEX IF NOT EXISTS idx_interactions_tags       ON interactions USING GIN (tags);

-- Index for soft-delete filtering
CREATE INDEX IF NOT EXISTS idx_interactions_deleted_at ON interactions (deleted_at) WHERE deleted_at IS NULL;
