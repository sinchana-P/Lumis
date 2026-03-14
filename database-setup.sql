-- ============================================
-- LUMIS DATABASE SCHEMA
-- ============================================
-- This script creates all necessary tables for the Lumis application
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/gfpetuqnyjxyrlxwzjes/sql

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  date_of_birth DATE,
  time_of_birth TIME,
  place_of_birth TEXT,
  place_of_birth_lat DECIMAL(10, 8),
  place_of_birth_lng DECIMAL(11, 8),
  avatar_url TEXT,
  provider TEXT NOT NULL DEFAULT 'local', -- 'local', 'google'
  analysis_depth_mode TEXT NOT NULL DEFAULT 'full-spectrum', -- 'cosmic', 'behavioral', 'full-spectrum'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- MEMBERS TABLE (People in user's life)
-- ============================================
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  nickname TEXT,
  date_of_birth DATE,
  time_of_birth TIME,
  place_of_birth TEXT,
  place_of_birth_lat DECIMAL(10, 8),
  place_of_birth_lng DECIMAL(11, 8),
  relation_type TEXT NOT NULL, -- 'friend', 'family', 'colleague', 'partner', 'other', etc.
  relation_type_custom TEXT, -- Custom relation type when relation_type is 'other'
  photo_url TEXT,
  notes TEXT,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TRAITS TABLE (User and Member traits)
-- ============================================
CREATE TABLE IF NOT EXISTS public.traits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'strength', 'shadow', 'trigger', 'need', 'pattern', 'pro', 'con'
  description TEXT NOT NULL,
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 3), -- 1=mild, 2=moderate, 3=strong
  emotion_tag TEXT, -- Optional emotion associated with trait
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure either user trait or member trait, not both
  CONSTRAINT trait_owner_check CHECK (
    (member_id IS NULL AND user_id IS NOT NULL) OR 
    (member_id IS NOT NULL AND user_id IS NOT NULL)
  )
);

-- ============================================
-- INCIDENTS TABLE (Significant events with members - positive or negative)
-- ============================================
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  incident_type TEXT NOT NULL DEFAULT 'negative', -- 'positive', 'negative', 'neutral'
  emotions TEXT[], -- Array of emotion tags
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 5), -- 1=minor, 5=major impact
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INTERACTIONS TABLE (General interactions with members)
-- ============================================
CREATE TABLE IF NOT EXISTS public.interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  mood_before TEXT, -- Emotion before interaction
  mood_after TEXT, -- Emotion after interaction
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5), -- 1=drained, 5=energized
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- JOURNAL ENTRIES TABLE (Private notes about members)
-- ============================================
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  content TEXT NOT NULL,
  emotions TEXT[], -- Array of emotion tags
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- PATTERNS TABLE (Detected behavioral patterns)
-- ============================================
CREATE TABLE IF NOT EXISTS public.patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  pattern_type TEXT NOT NULL, -- 'behavioral', 'emotional', 'timing', 'situational'
  confidence_score DECIMAL(3, 2) CHECK (confidence_score >= 0 AND confidence_score <= 1), -- 0.0 to 1.0
  first_observed DATE,
  last_observed DATE,
  occurrences INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- AI REPORTS TABLE (Generated AI insights)
-- ============================================
CREATE TABLE IF NOT EXISTS public.ai_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL, -- 'self', 'relationship'
  content JSONB NOT NULL, -- Structured AI report data
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  analysis_depth_mode TEXT NOT NULL, -- Mode used for generation
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- LUMEN CONVERSATIONS TABLE (AI chat history)
-- ============================================
CREATE TABLE IF NOT EXISTS public.lumen_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL, -- 'vent', 'guided', 'analysis', 'advice', 'timing'
  messages JSONB NOT NULL DEFAULT '[]', -- Array of message objects
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_archived ON public.members(archived);
CREATE INDEX IF NOT EXISTS idx_traits_user_id ON public.traits(user_id);
CREATE INDEX IF NOT EXISTS idx_traits_member_id ON public.traits(member_id);
CREATE INDEX IF NOT EXISTS idx_incidents_user_id ON public.incidents(user_id);
CREATE INDEX IF NOT EXISTS idx_incidents_member_id ON public.incidents(member_id);
CREATE INDEX IF NOT EXISTS idx_interactions_user_id ON public.interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_member_id ON public.interactions(member_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_member_id ON public.journal_entries(member_id);
CREATE INDEX IF NOT EXISTS idx_patterns_user_id ON public.patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_patterns_member_id ON public.patterns(member_id);
CREATE INDEX IF NOT EXISTS idx_ai_reports_user_id ON public.ai_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_lumen_conversations_user_id ON public.lumen_conversations(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lumen_conversations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Members policies
CREATE POLICY "Users can view own members" ON public.members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own members" ON public.members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own members" ON public.members
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own members" ON public.members
  FOR DELETE USING (auth.uid() = user_id);

-- Traits policies
CREATE POLICY "Users can view own traits" ON public.traits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own traits" ON public.traits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own traits" ON public.traits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own traits" ON public.traits
  FOR DELETE USING (auth.uid() = user_id);

-- Incidents policies
CREATE POLICY "Users can view own incidents" ON public.incidents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own incidents" ON public.incidents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own incidents" ON public.incidents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own incidents" ON public.incidents
  FOR DELETE USING (auth.uid() = user_id);

-- Interactions policies
CREATE POLICY "Users can view own interactions" ON public.interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions" ON public.interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interactions" ON public.interactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own interactions" ON public.interactions
  FOR DELETE USING (auth.uid() = user_id);

-- Journal entries policies
CREATE POLICY "Users can view own journal entries" ON public.journal_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries" ON public.journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries" ON public.journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries" ON public.journal_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Patterns policies
CREATE POLICY "Users can view own patterns" ON public.patterns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own patterns" ON public.patterns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own patterns" ON public.patterns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own patterns" ON public.patterns
  FOR DELETE USING (auth.uid() = user_id);

-- AI reports policies
CREATE POLICY "Users can view own ai reports" ON public.ai_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai reports" ON public.ai_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Lumen conversations policies
CREATE POLICY "Users can view own conversations" ON public.lumen_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON public.lumen_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON public.lumen_conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON public.lumen_conversations
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_traits_updated_at BEFORE UPDATE ON public.traits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.incidents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interactions_updated_at BEFORE UPDATE ON public.interactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patterns_updated_at BEFORE UPDATE ON public.patterns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lumen_conversations_updated_at BEFORE UPDATE ON public.lumen_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMPLETE!
-- ============================================
-- All tables, indexes, RLS policies, and triggers have been created.
-- You can now use the Lumis application with full database support.
