-- Migration: make member_id nullable in incidents, journal_entries, and patterns
-- This enables self-tracking (entries with no member association)
-- Run once in your Supabase SQL editor.

-- incidents
ALTER TABLE public.incidents
  ALTER COLUMN member_id DROP NOT NULL;

-- journal_entries
ALTER TABLE public.journal_entries
  ALTER COLUMN member_id DROP NOT NULL;

-- patterns
ALTER TABLE public.patterns
  ALTER COLUMN member_id DROP NOT NULL;
