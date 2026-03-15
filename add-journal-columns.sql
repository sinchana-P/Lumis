-- Add missing columns to journal_entries table
ALTER TABLE public.journal_entries
  ADD COLUMN IF NOT EXISTS title        TEXT,
  ADD COLUMN IF NOT EXISTS tags         TEXT[]        DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_private   BOOLEAN       NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at   TIMESTAMPTZ;

-- Rename emotions → mood for clarity (or add mood alias)
-- emotions column already exists; we keep it and add mood as alias via app layer

-- Default date to today if not provided
ALTER TABLE public.journal_entries
  ALTER COLUMN date SET DEFAULT CURRENT_DATE;

-- Index for fast member lookups
CREATE INDEX IF NOT EXISTS idx_journal_entries_member_id ON public.journal_entries(member_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_deleted_at  ON public.journal_entries(deleted_at);
