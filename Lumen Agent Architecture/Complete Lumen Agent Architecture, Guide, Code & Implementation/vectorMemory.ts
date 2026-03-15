// ═══════════════════════════════════════════════════════════════
// LUMIS AI — VECTOR MEMORY SYSTEM
// Stores and retrieves behavioral data using semantic search.
// Uses Cohere for embeddings, pgvector (via Supabase) for storage.
//
// What gets embedded:
//   - journal entries
//   - incidents (title + description + emotions)
//   - interactions (feeling + note)
//   - traits (category + description)
//
// Retrieved by semantic similarity when Lumen builds context.
// ═══════════════════════════════════════════════════════════════

import { EmbeddingsClient } from "../ai/clients";
import { Incident, Interaction, JournalEntry, Trait, DbVectorEntry } from "../types";

// ── SUPABASE SQL SETUP ────────────────────────────────────────
// Run in Supabase SQL editor:
//
// CREATE EXTENSION IF NOT EXISTS vector;
//
// CREATE TABLE vector_memory (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   member_id UUID NOT NULL,
//   user_id UUID NOT NULL,
//   source_type TEXT NOT NULL CHECK (source_type IN ('incident','interaction','journal','trait')),
//   source_id TEXT NOT NULL,
//   content TEXT NOT NULL,
//   embedding VECTOR(1024),
//   metadata JSONB DEFAULT '{}',
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );
//
// CREATE INDEX ON vector_memory USING ivfflat (embedding vector_cosine_ops)
//   WITH (lists = 100);
//
// CREATE INDEX ON vector_memory (member_id, source_type);
//
// Function for similarity search:
// CREATE OR REPLACE FUNCTION search_member_memory(
//   p_member_id UUID,
//   p_embedding VECTOR(1024),
//   p_top_k INT DEFAULT 5,
//   p_source_types TEXT[] DEFAULT NULL
// )
// RETURNS TABLE (
//   id UUID, source_type TEXT, source_id TEXT,
//   content TEXT, metadata JSONB, similarity FLOAT
// )
// LANGUAGE SQL AS $$
//   SELECT id, source_type, source_id, content, metadata,
//          1 - (embedding <=> p_embedding) AS similarity
//   FROM vector_memory
//   WHERE member_id = p_member_id
//     AND (p_source_types IS NULL OR source_type = ANY(p_source_types))
//   ORDER BY embedding <=> p_embedding
//   LIMIT p_top_k;
// $$;

export interface MemorySearchResult {
  id: string;
  sourceType: "incident" | "interaction" | "journal" | "trait";
  sourceId: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

export interface MemorySearchOptions {
  topK?: number;
  sourceTypes?: ("incident" | "interaction" | "journal" | "trait")[];
  minSimilarity?: number;
}

export class VectorMemory {
  constructor(
    private embeddings: EmbeddingsClient,
    private supabase: any  // Supabase client
  ) {}

  // ── STORE INCIDENT ───────────────────────────────────────────
  async storeIncident(incident: Incident, userId: string): Promise<void> {
    const content = [
      incident.title,
      incident.description,
      `Emotions: ${incident.emotions.join(", ")}`,
      `Type: ${incident.type}, Intensity: ${incident.intensity}`,
      incident.resolution ? `Resolution: ${incident.resolution}` : "",
    ].filter(Boolean).join(". ");

    await this.storeEntry({
      memberId: incident.memberId,
      userId,
      sourceType: "incident",
      sourceId: incident.id,
      content,
      metadata: {
        date: incident.date,
        type: incident.type,
        intensity: incident.intensity,
        emotions: incident.emotions,
      },
    });
  }

  // ── STORE INTERACTION ────────────────────────────────────────
  async storeInteraction(interaction: Interaction, userId: string): Promise<void> {
    const content = [
      `Felt ${interaction.feeling} during this interaction`,
      interaction.note || "",
      interaction.duration ? `Duration: ${interaction.duration} minutes` : "",
    ].filter(Boolean).join(". ");

    await this.storeEntry({
      memberId: interaction.memberId,
      userId,
      sourceType: "interaction",
      sourceId: interaction.id,
      content,
      metadata: {
        date: interaction.date,
        feeling: interaction.feeling,
        duration: interaction.duration,
      },
    });
  }

  // ── STORE JOURNAL ENTRY ──────────────────────────────────────
  async storeJournalEntry(entry: JournalEntry, userId: string): Promise<void> {
    await this.storeEntry({
      memberId: entry.memberId,
      userId,
      sourceType: "journal",
      sourceId: entry.id,
      content: entry.text,
      metadata: { date: entry.date },
    });
  }

  // ── STORE TRAIT ──────────────────────────────────────────────
  async storeTrait(trait: Trait, memberId: string, userId: string): Promise<void> {
    const content = `${trait.category}: ${trait.description}${trait.intensity ? ` (${trait.intensity})` : ""}`;

    await this.storeEntry({
      memberId, userId,
      sourceType: "trait",
      sourceId: trait.id,
      content,
      metadata: { category: trait.category, intensity: trait.intensity },
    });
  }

  // ── SEARCH BY QUERY ──────────────────────────────────────────
  async search(
    memberId: string,
    query: string,
    options: MemorySearchOptions = {}
  ): Promise<MemorySearchResult[]> {
    const { topK = 5, sourceTypes, minSimilarity = 0.3 } = options;

    // Embed query
    const queryEmbedding = await this.embeddings.embedQuery(query);

    // Search using pgvector function
    const { data, error } = await this.supabase.rpc("search_member_memory", {
      p_member_id: memberId,
      p_embedding: queryEmbedding,
      p_top_k: topK * 2,  // over-fetch, then filter
      p_source_types: sourceTypes || null,
    });

    if (error) throw error;

    return (data || [])
      .filter((r: any) => r.similarity >= minSimilarity)
      .slice(0, topK)
      .map((r: any) => ({
        id: r.id,
        sourceType: r.source_type,
        sourceId: r.source_id,
        content: r.content,
        metadata: r.metadata || {},
        similarity: r.similarity,
      }));
  }

  // ── SEARCH JOURNALS ONLY ─────────────────────────────────────
  async searchJournals(memberId: string, query: string, topK = 5): Promise<MemorySearchResult[]> {
    return this.search(memberId, query, { sourceTypes: ["journal"], topK });
  }

  // ── SEARCH INCIDENTS ONLY ────────────────────────────────────
  async searchIncidents(memberId: string, query: string, topK = 5): Promise<MemorySearchResult[]> {
    return this.search(memberId, query, { sourceTypes: ["incident"], topK });
  }

  // ── BUILD CONTEXT STRING FOR AI PROMPT ──────────────────────
  async buildContextString(memberId: string, query: string): Promise<string> {
    const results = await this.search(memberId, query, { topK: 6 });
    if (!results.length) return "No specific memories found for this query.";

    const byType: Record<string, MemorySearchResult[]> = {};
    for (const r of results) {
      if (!byType[r.sourceType]) byType[r.sourceType] = [];
      byType[r.sourceType].push(r);
    }

    let ctx = "Relevant memories retrieved:\n\n";

    if (byType.incident) {
      ctx += "Incidents:\n";
      byType.incident.forEach(r => {
        ctx += `  [${r.metadata.date}] ${r.content}\n`;
      });
    }
    if (byType.journal) {
      ctx += "Journal entries:\n";
      byType.journal.forEach(r => {
        ctx += `  [${r.metadata.date}] "${r.content}"\n`;
      });
    }
    if (byType.interaction) {
      ctx += "Interactions:\n";
      byType.interaction.forEach(r => {
        ctx += `  [${r.metadata.date}] ${r.content}\n`;
      });
    }
    if (byType.trait) {
      ctx += "Logged traits:\n";
      byType.trait.forEach(r => {
        ctx += `  ${r.content}\n`;
      });
    }

    return ctx;
  }

  // ── REINDEX ALL DATA FOR A MEMBER ────────────────────────────
  // Call when a new member is added or batch-updating
  async reindexMember(
    memberId: string,
    userId: string,
    data: {
      incidents?: Incident[];
      interactions?: Interaction[];
      journals?: JournalEntry[];
      traits?: Trait[];
    }
  ): Promise<void> {
    // Delete existing vectors for this member
    await this.supabase.from("vector_memory").delete().match({ member_id: memberId });

    // Re-embed and store
    const tasks: Promise<void>[] = [];

    if (data.incidents) {
      for (const inc of data.incidents) {
        tasks.push(this.storeIncident(inc, userId));
      }
    }
    if (data.interactions) {
      for (const int of data.interactions) {
        tasks.push(this.storeInteraction(int, userId));
      }
    }
    if (data.journals) {
      for (const j of data.journals) {
        tasks.push(this.storeJournalEntry(j, userId));
      }
    }
    if (data.traits) {
      for (const t of data.traits) {
        tasks.push(this.storeTrait(t, memberId, userId));
      }
    }

    // Run in batches to respect rate limits
    const BATCH_SIZE = 10;
    for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
      await Promise.all(tasks.slice(i, i + BATCH_SIZE));
    }
  }

  // ── INTERNAL STORE ───────────────────────────────────────────
  private async storeEntry(entry: {
    memberId: string; userId: string;
    sourceType: string; sourceId: string;
    content: string; metadata: Record<string, unknown>;
  }): Promise<void> {
    const [embedding] = await this.embeddings.embedDocuments([entry.content]);

    const { error } = await this.supabase.from("vector_memory").upsert({
      member_id: entry.memberId,
      user_id: entry.userId,
      source_type: entry.sourceType,
      source_id: entry.sourceId,
      content: entry.content,
      embedding,
      metadata: entry.metadata,
    }, { onConflict: "member_id,source_id" });

    if (error) throw error;
  }

  // ── TRAIT SIMILARITY MATCHING ────────────────────────────────
  // Find members whose traits match a given query (e.g. "avoidant patterns")
  async findSimilarTraits(
    userId: string,
    query: string,
    excludeMemberId?: string
  ): Promise<{ memberId: string; content: string; similarity: number }[]> {
    const queryEmbedding = await this.embeddings.embedQuery(query);

    const { data, error } = await this.supabase.rpc("search_all_traits_for_user", {
      p_user_id: userId,
      p_embedding: queryEmbedding,
      p_exclude_member: excludeMemberId || null,
      p_top_k: 10,
    });

    if (error) return [];
    return (data || []).map((r: any) => ({
      memberId: r.member_id,
      content: r.content,
      similarity: r.similarity,
    }));
  }
}
