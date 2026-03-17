import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CohereClient } from 'cohere-ai';

@Injectable()
export class EmbeddingsService {
  private readonly client: CohereClient;
  private readonly MODEL = 'embed-english-v3.0';

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ai.cohere.apiKey')!;
    this.client = new CohereClient({ token: apiKey });
  }

  async embedQuery(text: string): Promise<number[]> {
    const res = await this.client.embed({
      texts: [text],
      model: this.MODEL,
      inputType: 'search_query',
    });
    return (res.embeddings as number[][])[0];
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    if (!texts.length) return [];
    const res = await this.client.embed({
      texts,
      model: this.MODEL,
      inputType: 'search_document',
    });
    return res.embeddings as number[][];
  }

  // Batch in chunks of 96 (Cohere limit)
  async embedDocumentsBatch(texts: string[]): Promise<number[][]> {
    const CHUNK_SIZE = 96;
    const results: number[][] = [];
    for (let i = 0; i < texts.length; i += CHUNK_SIZE) {
      const chunk = texts.slice(i, i + CHUNK_SIZE);
      const embeddings = await this.embedDocuments(chunk);
      results.push(...embeddings);
    }
    return results;
  }

  static cosineSim(a: number[], b: number[]): number {
    const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
    const magA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
    const magB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
    if (magA === 0 || magB === 0) return 0;
    return dot / (magA * magB);
  }
}
