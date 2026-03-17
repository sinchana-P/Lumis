import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../common/services/supabase.service';
import { EmbeddingsService } from '../ai/embeddings.service';

export interface MemorySearchResult {
  id: string;
  sourceType: 'incident' | 'interaction' | 'journal' | 'trait';
  sourceId: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

export interface StoreEntryInput {
  memberId: string;
  userId: string;
  sourceType: 'incident' | 'interaction' | 'journal' | 'trait';
  sourceId: string;
  content: string;
  metadata: Record<string, unknown>;
}

@Injectable()
export class VectorMemoryService {
  private readonly logger = new Logger(VectorMemoryService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly embeddings: EmbeddingsService,
  ) {}

  async storeIncident(incident: { id: string; memberId: string; title: string; description: string; emotions: string[]; type: string; intensity: string; resolution?: string; date: string }, userId: string): Promise<void> {
    const content = [
      incident.title,
      incident.description,
      `Emotions: ${incident.emotions.join(', ')}`,
      `Type: ${incident.type}, Intensity: ${incident.intensity}`,
      incident.resolution ? `Resolution: ${incident.resolution}` : '',
    ].filter(Boolean).join('. ');

    await this.storeEntry({ memberId: incident.memberId, userId, sourceType: 'incident', sourceId: incident.id, content, metadata: { date: incident.date, type: incident.type, intensity: incident.intensity, emotions: incident.emotions } });
  }

  async storeInteraction(interaction: { id: string; memberId: string; feeling: string; note?: string; duration?: number; date: string }, userId: string): Promise<void> {
    const content = [
      `Felt ${interaction.feeling} during this interaction`,
      interaction.note || '',
      interaction.duration ? `Duration: ${interaction.duration} minutes` : '',
    ].filter(Boolean).join('. ');

    await this.storeEntry({ memberId: interaction.memberId, userId, sourceType: 'interaction', sourceId: interaction.id, content, metadata: { date: interaction.date, feeling: interaction.feeling, duration: interaction.duration } });
  }

  async storeJournalEntry(entry: { id: string; memberId: string; text: string; date: string }, userId: string): Promise<void> {
    await this.storeEntry({ memberId: entry.memberId, userId, sourceType: 'journal', sourceId: entry.id, content: entry.text, metadata: { date: entry.date } });
  }

  async storeTrait(trait: { id: string; category: string; description: string; intensity?: string }, memberId: string, userId: string): Promise<void> {
    const content = `${trait.category}: ${trait.description}${trait.intensity ? ` (${trait.intensity})` : ''}`;
    await this.storeEntry({ memberId, userId, sourceType: 'trait', sourceId: trait.id, content, metadata: { category: trait.category, intensity: trait.intensity } });
  }

  async search(memberId: string, query: string, topK = 5, sourceTypes?: ('incident' | 'interaction' | 'journal' | 'trait')[], minSimilarity = 0.3): Promise<MemorySearchResult[]> {
    const queryEmbedding = await this.embeddings.embedQuery(query);
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase.rpc('search_member_memory', {
      p_member_id: memberId,
      p_embedding: queryEmbedding,
      p_top_k: topK * 2,
      p_source_types: sourceTypes || null,
    });

    if (error) throw new Error(error.message);

    return (data || [])
      .filter((r: any) => r.similarity >= minSimilarity)
      .slice(0, topK)
      .map((r: any) => ({ id: r.id, sourceType: r.source_type, sourceId: r.source_id, content: r.content, metadata: r.metadata || {}, similarity: r.similarity }));
  }

  async buildContextString(memberId: string, query: string): Promise<string> {
    const results = await this.search(memberId, query, 6);
    if (!results.length) return 'No specific memories found for this query.';

    const byType: Record<string, MemorySearchResult[]> = {};
    for (const r of results) {
      if (!byType[r.sourceType]) byType[r.sourceType] = [];
      byType[r.sourceType].push(r);
    }

    let ctx = 'Relevant memories retrieved:\n\n';
    if (byType.incident) {
      ctx += 'Incidents:\n';
      byType.incident.forEach(r => { ctx += `  [${r.metadata.date}] ${r.content}\n`; });
    }
    if (byType.journal) {
      ctx += 'Journal entries:\n';
      byType.journal.forEach(r => { ctx += `  [${r.metadata.date}] "${r.content}"\n`; });
    }
    if (byType.interaction) {
      ctx += 'Interactions:\n';
      byType.interaction.forEach(r => { ctx += `  [${r.metadata.date}] ${r.content}\n`; });
    }
    if (byType.trait) {
      ctx += 'Logged traits:\n';
      byType.trait.forEach(r => { ctx += `  ${r.content}\n`; });
    }

    return ctx;
  }

  async reindexMember(memberId: string, userId: string, data: { incidents?: any[]; interactions?: any[]; journals?: any[]; traits?: any[] }): Promise<void> {
    const supabase = this.supabaseService.getAdminClient();
    await supabase.from('vector_memory').delete().match({ member_id: memberId });

    const tasks: Promise<void>[] = [];
    data.incidents?.forEach(inc => tasks.push(this.storeIncident(inc, userId)));
    data.interactions?.forEach(int => tasks.push(this.storeInteraction(int, userId)));
    data.journals?.forEach(j => tasks.push(this.storeJournalEntry(j, userId)));
    data.traits?.forEach(t => tasks.push(this.storeTrait(t, memberId, userId)));

    const BATCH_SIZE = 10;
    for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
      await Promise.all(tasks.slice(i, i + BATCH_SIZE));
    }
  }

  async findSimilarTraits(userId: string, query: string, excludeMemberId?: string): Promise<{ memberId: string; content: string; similarity: number }[]> {
    const queryEmbedding = await this.embeddings.embedQuery(query);
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase.rpc('search_all_traits_for_user', {
      p_user_id: userId,
      p_embedding: queryEmbedding,
      p_exclude_member: excludeMemberId || null,
      p_top_k: 10,
    });

    if (error) return [];
    return (data || []).map((r: any) => ({ memberId: r.member_id, content: r.content, similarity: r.similarity }));
  }

  private async storeEntry(entry: StoreEntryInput): Promise<void> {
    const supabase = this.supabaseService.getAdminClient();
    const [embedding] = await this.embeddings.embedDocuments([entry.content]);

    const { error } = await supabase.from('vector_memory').upsert({
      member_id: entry.memberId,
      user_id: entry.userId,
      source_type: entry.sourceType,
      source_id: entry.sourceId,
      content: entry.content,
      embedding,
      metadata: entry.metadata,
    }, { onConflict: 'member_id,source_id' });

    if (error) {
      this.logger.error(`Failed to store vector memory: ${error.message}`);
      throw new Error(error.message);
    }
  }
}
