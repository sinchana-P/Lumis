-- ═══════════════════════════════════════════════════════════════
-- LUMIS AI ENGINE — DATABASE MIGRATION
-- Run this in Supabase SQL editor.
-- ═══════════════════════════════════════════════════════════════

-- ── 0. Extensions ────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;

-- ── 1. NUMEROLOGY PROFILES ───────────────────────────────────────
-- Polymorphic: member_id NULL = user self-profile; member_id SET = member profile
CREATE TABLE IF NOT EXISTS numerology_profiles (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id      UUID REFERENCES members(id) ON DELETE CASCADE,
  dob_hash       TEXT,
  name_hash      TEXT,
  core_numbers   JSONB NOT NULL DEFAULT '{}',
  timing_numbers JSONB NOT NULL DEFAULT '{}',
  insights       JSONB NOT NULL DEFAULT '{}',
  compatibility  JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (member_id),
  UNIQUE (user_id, member_id)
);

CREATE INDEX IF NOT EXISTS numerology_profiles_user_id_idx ON numerology_profiles(user_id);
CREATE INDEX IF NOT EXISTS numerology_profiles_member_id_idx ON numerology_profiles(member_id);

ALTER TABLE numerology_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own numerology profiles"
  ON numerology_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 2. ASTROLOGY PROFILES ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS astrology_profiles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id  UUID REFERENCES members(id) ON DELETE CASCADE,
  computed   JSONB NOT NULL DEFAULT '{}',
  insights   JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (member_id),
  UNIQUE (user_id, member_id)
);

CREATE INDEX IF NOT EXISTS astrology_profiles_user_id_idx ON astrology_profiles(user_id);
CREATE INDEX IF NOT EXISTS astrology_profiles_member_id_idx ON astrology_profiles(member_id);

ALTER TABLE astrology_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own astrology profiles"
  ON astrology_profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 3. VECTOR MEMORY ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vector_memory (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('incident','interaction','journal','trait')),
  source_id   TEXT NOT NULL,
  content     TEXT NOT NULL,
  embedding   VECTOR(1024),
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (member_id, source_id)
);

-- IVFFlat index for cosine similarity search (tune lists= for your data size)
CREATE INDEX IF NOT EXISTS vector_memory_embedding_idx
  ON vector_memory USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS vector_memory_member_source_idx
  ON vector_memory(member_id, source_type);

ALTER TABLE vector_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own vector memory"
  ON vector_memory FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 4. SEARCH FUNCTIONS ──────────────────────────────────────────

-- Search semantic memory for a specific member
CREATE OR REPLACE FUNCTION search_member_memory(
  p_member_id   UUID,
  p_embedding   VECTOR(1024),
  p_top_k       INT DEFAULT 5,
  p_source_types TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  id          UUID,
  source_type TEXT,
  source_id   TEXT,
  content     TEXT,
  metadata    JSONB,
  similarity  FLOAT
)
LANGUAGE SQL STABLE AS $$
  SELECT
    id, source_type, source_id, content, metadata,
    1 - (embedding <=> p_embedding) AS similarity
  FROM vector_memory
  WHERE member_id = p_member_id
    AND (p_source_types IS NULL OR source_type = ANY(p_source_types))
  ORDER BY embedding <=> p_embedding
  LIMIT p_top_k;
$$;

-- Search traits across all members for a user (cross-member pattern detection)
CREATE OR REPLACE FUNCTION search_all_traits_for_user(
  p_user_id       UUID,
  p_embedding     VECTOR(1024),
  p_exclude_member UUID DEFAULT NULL,
  p_top_k         INT DEFAULT 10
)
RETURNS TABLE (
  member_id   UUID,
  content     TEXT,
  similarity  FLOAT
)
LANGUAGE SQL STABLE AS $$
  SELECT
    member_id,
    content,
    1 - (embedding <=> p_embedding) AS similarity
  FROM vector_memory
  WHERE user_id = p_user_id
    AND source_type = 'trait'
    AND (p_exclude_member IS NULL OR member_id != p_exclude_member)
  ORDER BY embedding <=> p_embedding
  LIMIT p_top_k;
$$;

-- ── 5. AUTO-UPDATE TRIGGERS ──────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_numerology_profiles_updated_at') THEN
    CREATE TRIGGER set_numerology_profiles_updated_at
      BEFORE UPDATE ON numerology_profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_astrology_profiles_updated_at') THEN
    CREATE TRIGGER set_astrology_profiles_updated_at
      BEFORE UPDATE ON astrology_profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;
