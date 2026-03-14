---
inclusion: fileMatch
fileMatchPattern: "**/*.{entity,model,migration,schema}.{ts,sql}"
---

# Lumis Database Schema

## Core Principles
- Soft deletes everywhere (deleted_at timestamp)
- Row-level security (RLS) on all tables
- Polymorphic associations where applicable
- Audit fields: created_at, updated_at, created_by, updated_by
- UUID primary keys

## Schema Overview

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  photo_url TEXT,
  date_of_birth DATE NOT NULL,
  time_of_birth TIME,
  place_of_birth VARCHAR(255),
  birth_latitude DECIMAL(10, 8),
  birth_longitude DECIMAL(11, 8),
  analysis_depth_mode VARCHAR(20) DEFAULT 'full-spectrum', -- 'cosmic', 'behavioral', 'full-spectrum'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- RLS Policy
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own data"
  ON users FOR ALL
  USING (auth.uid() = id);
```

### numerology_data
```sql
CREATE TABLE numerology_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL,
  owner_type VARCHAR(50) NOT NULL, -- 'user' or 'member'
  life_path_number INTEGER,
  expression_number INTEGER,
  soul_urge_number INTEGER,
  personality_number INTEGER,
  birthday_number INTEGER,
  maturity_number INTEGER,
  personal_year INTEGER,
  personal_month INTEGER,
  personal_day INTEGER,
  life_cycle_current INTEGER,
  calculated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_owner CHECK (
    (owner_type = 'user' AND owner_id IN (SELECT id FROM users)) OR
    (owner_type = 'member' AND owner_id IN (SELECT id FROM members))
  )
);

CREATE INDEX idx_numerology_owner ON numerology_data(owner_id, owner_type);
```

### astrology_data
```sql
CREATE TABLE astrology_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL,
  owner_type VARCHAR(50) NOT NULL, -- 'user' or 'member'
  sun_sign VARCHAR(50),
  moon_sign VARCHAR(50),
  rising_sign VARCHAR(50),
  venus_sign VARCHAR(50),
  mars_sign VARCHAR(50),
  mercury_sign VARCHAR(50),
  dominant_element VARCHAR(50),
  natal_chart_data JSONB, -- Full chart data
  current_transits JSONB, -- Current planetary positions
  calculated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT fk_owner CHECK (
    (owner_type = 'user' AND owner_id IN (SELECT id FROM users)) OR
    (owner_type = 'member' AND owner_id IN (SELECT id FROM members))
  )
);

CREATE INDEX idx_astrology_owner ON astrology_data(owner_id, owner_type);
```

### traits
Polymorphic table for user self-traits AND member pros/cons
```sql
CREATE TABLE traits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL,
  owner_type VARCHAR(50) NOT NULL, -- 'user' or 'member'
  category VARCHAR(50) NOT NULL, -- 'strength', 'shadow', 'trigger', 'need', 'pattern', 'pro', 'con'
  description TEXT NOT NULL,
  intensity INTEGER, -- 1=mild, 2=moderate, 3=strong (for pros/cons only)
  emotion_tag VARCHAR(50), -- for pros/cons only
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  CONSTRAINT fk_owner CHECK (
    (owner_type = 'user' AND owner_id IN (SELECT id FROM users)) OR
    (owner_type = 'member' AND owner_id IN (SELECT id FROM members))
  )
);

CREATE INDEX idx_traits_owner ON traits(owner_id, owner_type);
CREATE INDEX idx_traits_category ON traits(category);
```

### members
```sql
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  photo_url TEXT,
  relation_type VARCHAR(50) NOT NULL, -- 'friend', 'family', 'colleague', 'partner', 'acquaintance', 'boss', 'mentor', 'therapist', 'coach', 'teacher', 'student', 'neighbor', 'ex-partner', 'other'
  relation_type_custom VARCHAR(100), -- Custom relation type when 'other' is selected
  tags TEXT[], -- Array of custom tags
  date_of_birth DATE,
  time_of_birth TIME,
  place_of_birth VARCHAR(255),
  birth_latitude DECIMAL(10, 8),
  birth_longitude DECIMAL(11, 8),
  relationship_start_date DATE,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_members_user ON members(user_id);
CREATE INDEX idx_members_archived ON members(archived);

-- RLS Policy
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own members"
  ON members FOR ALL
  USING (user_id = auth.uid());
```

### logs
Polymorphic table for incidents, interactions, journal entries
```sql
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  log_type VARCHAR(50) NOT NULL, -- 'incident', 'interaction', 'journal'
  log_date DATE NOT NULL,
  description TEXT NOT NULL,
  
  -- Incident-specific
  emotional_impact TEXT,
  
  -- Interaction-specific
  context TEXT,
  mood_before VARCHAR(50),
  mood_after VARCHAR(50),
  
  -- Journal-specific (uses description field)
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_logs_member ON logs(member_id);
CREATE INDEX idx_logs_type ON logs(log_type);
CREATE INDEX idx_logs_date ON logs(log_date DESC);

-- RLS Policy
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access logs for their members"
  ON logs FOR ALL
  USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));
```

### patterns
```sql
CREATE TABLE patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  frequency_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_patterns_member ON patterns(member_id);

-- RLS Policy
ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access patterns for their members"
  ON patterns FOR ALL
  USING (member_id IN (SELECT id FROM members WHERE user_id = auth.uid()));
```

### ai_reports
```sql
CREATE TABLE ai_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_type VARCHAR(50) NOT NULL, -- 'self' or 'relationship'
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE, -- NULL for self reports
  
  -- Self report fields
  attachment_style VARCHAR(50),
  emotional_trigger_map JSONB,
  relationship_patterns JSONB,
  
  -- Relationship report fields
  compatibility_score INTEGER, -- 0-100
  dynamic_type VARCHAR(100),
  tension_points JSONB,
  growth_points JSONB,
  forecast TEXT,
  timing_guidance TEXT,
  
  full_report_text TEXT,
  generated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reports_user ON ai_reports(user_id);
CREATE INDEX idx_reports_member ON ai_reports(member_id);
CREATE INDEX idx_reports_type ON ai_reports(report_type);

-- RLS Policy
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own reports"
  ON ai_reports FOR ALL
  USING (user_id = auth.uid());
```

### lumen_conversations
```sql
CREATE TABLE lumen_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  mode VARCHAR(50) NOT NULL, -- 'vent', 'guided', 'analysis', 'advice', 'timing'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_conversations_user ON lumen_conversations(user_id);

-- RLS Policy
ALTER TABLE lumen_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own conversations"
  ON lumen_conversations FOR ALL
  USING (user_id = auth.uid());
```

### lumen_messages
```sql
CREATE TABLE lumen_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES lumen_conversations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  context_used JSONB, -- What data was used for this response
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON lumen_messages(conversation_id);
CREATE INDEX idx_messages_created ON lumen_messages(created_at DESC);

-- RLS Policy
ALTER TABLE lumen_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access messages in their conversations"
  ON lumen_messages FOR ALL
  USING (conversation_id IN (SELECT id FROM lumen_conversations WHERE user_id = auth.uid()));
```

### mood_check_ins
```sql
CREATE TABLE mood_check_ins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emotions TEXT[], -- Array of emotion tags
  notes TEXT,
  check_in_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mood_user ON mood_check_ins(user_id);
CREATE INDEX idx_mood_date ON mood_check_ins(check_in_date DESC);

-- RLS Policy
ALTER TABLE mood_check_ins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own mood check-ins"
  ON mood_check_ins FOR ALL
  USING (user_id = auth.uid());
```

### weekly_digests
```sql
CREATE TABLE weekly_digests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  emotional_summary TEXT,
  relationship_highlights JSONB,
  pattern_alerts JSONB,
  suggested_focus_areas TEXT[],
  generated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_digests_user ON weekly_digests(user_id);
CREATE INDEX idx_digests_week ON weekly_digests(week_start_date DESC);

-- RLS Policy
ALTER TABLE weekly_digests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own digests"
  ON weekly_digests FOR ALL
  USING (user_id = auth.uid());
```

### share_links
```sql
CREATE TABLE share_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  share_type VARCHAR(50) NOT NULL, -- 'self_profile', 'member_profile', 'ai_report'
  resource_id UUID, -- member_id or report_id
  visibility_settings JSONB, -- What sections are visible
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  revoked_at TIMESTAMP
);

CREATE INDEX idx_share_links_token ON share_links(token);
CREATE INDEX idx_share_links_user ON share_links(user_id);

-- RLS Policy
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only manage their own share links"
  ON share_links FOR ALL
  USING (user_id = auth.uid());
```

## Vector Search Setup (pgvector)

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to logs for semantic search
ALTER TABLE logs ADD COLUMN embedding vector(1536);

-- Create index for vector similarity search
CREATE INDEX idx_logs_embedding ON logs USING ivfflat (embedding vector_cosine_ops);

-- Function to search journal entries semantically
CREATE OR REPLACE FUNCTION search_journal_entries(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_member_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  member_id uuid,
  description text,
  log_date date,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    logs.id,
    logs.member_id,
    logs.description,
    logs.log_date,
    1 - (logs.embedding <=> query_embedding) AS similarity
  FROM logs
  WHERE
    logs.log_type = 'journal'
    AND logs.deleted_at IS NULL
    AND (filter_member_id IS NULL OR logs.member_id = filter_member_id)
    AND 1 - (logs.embedding <=> query_embedding) > match_threshold
  ORDER BY logs.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

## Indexes for Performance

```sql
-- Composite indexes for common queries
CREATE INDEX idx_members_user_archived ON members(user_id, archived);
CREATE INDEX idx_traits_owner_category ON traits(owner_id, owner_type, category);
CREATE INDEX idx_logs_member_type_date ON logs(member_id, log_type, log_date DESC);

-- Full-text search indexes
CREATE INDEX idx_logs_description_fts ON logs USING gin(to_tsvector('english', description));
CREATE INDEX idx_traits_description_fts ON traits USING gin(to_tsvector('english', description));
```

## Database Functions

### Calculate Relationship Health Score
```sql
CREATE OR REPLACE FUNCTION calculate_relationship_health(p_member_id uuid)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_score integer := 50; -- Start at neutral
  v_pros_count integer;
  v_cons_count integer;
  v_positive_interactions integer;
  v_negative_interactions integer;
BEGIN
  -- Count pros and cons
  SELECT COUNT(*) INTO v_pros_count FROM traits WHERE owner_id = p_member_id AND category = 'pro' AND deleted_at IS NULL;
  SELECT COUNT(*) INTO v_cons_count FROM traits WHERE owner_id = p_member_id AND category = 'con' AND deleted_at IS NULL;
  
  -- Count positive vs negative interactions (last 30 days)
  SELECT COUNT(*) INTO v_positive_interactions
  FROM logs
  WHERE member_id = p_member_id
    AND log_type = 'interaction'
    AND log_date >= CURRENT_DATE - INTERVAL '30 days'
    AND mood_after IN ('joyful', 'safe', 'energized', 'peaceful', 'loved', 'understood', 'inspired')
    AND deleted_at IS NULL;
  
  SELECT COUNT(*) INTO v_negative_interactions
  FROM logs
  WHERE member_id = p_member_id
    AND log_type = 'interaction'
    AND log_date >= CURRENT_DATE - INTERVAL '30 days'
    AND mood_after IN ('anxious', 'drained', 'confused', 'hurt', 'invisible', 'controlled', 'dismissed')
    AND deleted_at IS NULL;
  
  -- Calculate score
  v_score := v_score + (v_pros_count * 5) - (v_cons_count * 3);
  v_score := v_score + (v_positive_interactions * 2) - (v_negative_interactions * 3);
  
  -- Clamp between 0 and 100
  v_score := GREATEST(0, LEAST(100, v_score));
  
  RETURN v_score;
END;
$$;
```

## Migrations Strategy
- Use TypeORM or Prisma migrations
- Never drop columns (mark as deprecated)
- Always use transactions for multi-step migrations
- Test migrations on staging before production
- Keep rollback scripts ready
