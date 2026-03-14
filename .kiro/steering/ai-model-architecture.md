---
inclusion: fileMatch
fileMatchPattern: "**/ai/**/*.{ts,tsx}"
---

# Lumis AI Model Architecture

## Two-Model Architecture (Free Tiers Only)

Lumis uses a strategic two-model approach to balance depth and speed while staying on free tiers.

```
LUMEN (AI Agent)
│
├── PRIMARY — Gemini 1.5 Flash (free)
│   Used for:
│   ├── AI Self Report generation
│   ├── AI Relationship Report generation
│   ├── Deep analysis queries (full profile context)
│   ├── Weekly digest generation
│   └── Complex pattern analysis
│
├── SPEED LAYER — Groq + Llama 3.1 70B (free)
│   Used for:
│   ├── Vent mode (needs to feel instant)
│   ├── Quick mood queries
│   ├── Daily check-in responses
│   ├── Short pattern alerts
│   └── Real-time chat interactions
│
└── EMBEDDINGS — Cohere (free)
    Used for:
    ├── Journal semantic search
    ├── Trait similarity matching
    └── Finding related incidents/patterns
```

---

## Model Comparison

### Context Window (bigger = better for Lumis)
```
Gemini 1.5 Flash    ████████████████████  1,000,000 tokens 🏆
Llama 3.1 (Groq)    ████████             128,000 tokens
GPT-4o-mini         ████                 128,000 tokens (not free)
Mistral Small       ████                 32,000 tokens
```

### Emotional Warmth / Nuance
```
Gemini 1.5 Flash    ████████████████████  Best free option 🏆
Llama 3.1 70B       ████████████████      Very good
Mistral Small       ████████████          Good
Llama 3.1 8B        ████████              Decent
Groq Mixtral        ██████                More technical
```

### Speed (for real-time chat feel)
```
Groq (any model)    ████████████████████  500+ tokens/sec 🏆
Gemini Flash        ████████████████      Fast
Mistral             ████████              Medium
```

---

## Model Selection Logic

### Service Layer
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { CohereClient } from 'cohere-ai';

@Injectable()
export class LumenService {
  private gemini: GoogleGenerativeAI;
  private groq: Groq;
  private cohere: CohereClient;

  constructor() {
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    this.cohere = new CohereClient({ token: process.env.COHERE_API_KEY });
  }

  async query(
    userId: string,
    query: string,
    mode: LumenMode,
    depth: AnalysisDepthMode
  ): Promise<string> {
    // Route to appropriate model based on use case
    const useSpeedLayer = this.shouldUseSpeedLayer(mode, query);
    
    if (useSpeedLayer) {
      return this.queryGroq(userId, query, mode, depth);
    } else {
      return this.queryGemini(userId, query, mode, depth);
    }
  }

  private shouldUseSpeedLayer(mode: LumenMode, query: string): boolean {
    // Use Groq for speed-critical interactions
    if (mode === 'vent') return true;
    if (query.length < 100) return true; // Short queries
    
    // Use Gemini for deep analysis
    if (mode === 'analysis') return false;
    if (mode === 'advice') return false;
    
    // Default to Groq for guided mode (conversational)
    return mode === 'guided';
  }
}
```

---

## Gemini 1.5 Flash Implementation

### Use Cases
- AI Self Reports (needs full user context)
- AI Relationship Reports (needs both user + member context)
- Deep analysis queries (complex pattern recognition)
- Weekly digests (summarizing week of data)
- Full Spectrum mode with large context

### Configuration
```typescript
async queryGemini(
  userId: string,
  query: string,
  mode: LumenMode,
  depth: AnalysisDepthMode
): Promise<string> {
  const context = await this.contextBuilder.build(userId, depth);
  const systemPrompt = this.buildSystemPrompt(mode, depth);
  
  const model = this.gemini.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    },
  });

  const chat = model.startChat({
    history: [
      {
        role: 'user',
        parts: [{ text: systemPrompt }],
      },
      {
        role: 'model',
        parts: [{ text: 'I understand. I am Lumen, ready to help.' }],
      },
    ],
  });

  const result = await chat.sendMessage(
    `Context: ${JSON.stringify(context)}\n\nUser Query: ${query}`
  );
  
  return result.response.text();
}
```

### Streaming Support
```typescript
async streamGemini(
  userId: string,
  query: string,
  mode: LumenMode,
  depth: AnalysisDepthMode
): Promise<ReadableStream> {
  const context = await this.contextBuilder.build(userId, depth);
  const systemPrompt = this.buildSystemPrompt(mode, depth);
  
  const model = this.gemini.getGenerativeModel({
    model: 'gemini-1.5-flash',
  });

  const chat = model.startChat({
    history: [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'I understand.' }] },
    ],
  });

  const result = await chat.sendMessageStream(
    `Context: ${JSON.stringify(context)}\n\nUser Query: ${query}`
  );

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of result.stream) {
        controller.enqueue(chunk.text());
      }
      controller.close();
    },
  });
}
```

### Free Tier Limits
- 15 requests per minute
- 1 million requests per day
- 1,000,000 token context window
- 8,192 max output tokens

---

## Groq + Llama 3.1 70B Implementation

### Use Cases
- Vent mode (instant empathy)
- Quick mood queries ("I feel anxious")
- Daily check-in responses
- Short pattern alerts
- Real-time conversational flow

### Configuration
```typescript
async queryGroq(
  userId: string,
  query: string,
  mode: LumenMode,
  depth: AnalysisDepthMode
): Promise<string> {
  // Build lighter context for speed
  const context = await this.contextBuilder.buildLight(userId, depth);
  const systemPrompt = this.buildSystemPrompt(mode, depth);

  const completion = await this.groq.chat.completions.create({
    model: 'llama-3.1-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Context: ${JSON.stringify(context)}\n\nQuery: ${query}` },
    ],
    temperature: 0.7,
    max_tokens: 2048,
    top_p: 0.95,
  });

  return completion.choices[0].message.content;
}
```

### Streaming Support
```typescript
async streamGroq(
  userId: string,
  query: string,
  mode: LumenMode,
  depth: AnalysisDepthMode
): Promise<ReadableStream> {
  const context = await this.contextBuilder.buildLight(userId, depth);
  const systemPrompt = this.buildSystemPrompt(mode, depth);

  const stream = await this.groq.chat.completions.create({
    model: 'llama-3.1-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Context: ${JSON.stringify(context)}\n\nQuery: ${query}` },
    ],
    temperature: 0.7,
    max_tokens: 2048,
    stream: true,
  });

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          controller.enqueue(content);
        }
      }
      controller.close();
    },
  });
}
```

### Free Tier Limits
- 30 requests per minute
- 14,400 requests per day
- 128,000 token context window
- 500+ tokens per second (blazing fast)

---

## Cohere Embeddings Implementation

### Use Cases
- Semantic search over journal entries
- Find similar traits across members
- Discover related incidents/patterns
- "Show me all times I felt this way"

### Configuration
```typescript
async generateEmbedding(text: string): Promise<number[]> {
  const response = await this.cohere.embed({
    texts: [text],
    model: 'embed-english-v3.0',
    inputType: 'search_document',
  });

  return response.embeddings[0];
}

async searchJournal(
  userId: string,
  query: string,
  limit: number = 10
): Promise<JournalEntry[]> {
  // Generate query embedding
  const queryEmbedding = await this.generateEmbedding(query);

  // Search using pgvector
  const results = await this.db.query(
    `
    SELECT id, member_id, description, log_date,
           1 - (embedding <=> $1::vector) AS similarity
    FROM logs
    WHERE user_id = $2
      AND log_type = 'journal'
      AND deleted_at IS NULL
    ORDER BY embedding <=> $1::vector
    LIMIT $3
    `,
    [queryEmbedding, userId, limit]
  );

  return results.rows;
}
```

### Batch Embedding Generation
```typescript
async embedJournalEntries(entries: JournalEntry[]): Promise<void> {
  const texts = entries.map(e => e.description);
  
  // Cohere supports batch embedding (up to 96 texts)
  const response = await this.cohere.embed({
    texts,
    model: 'embed-english-v3.0',
    inputType: 'search_document',
  });

  // Update database with embeddings
  for (let i = 0; i < entries.length; i++) {
    await this.db.query(
      'UPDATE logs SET embedding = $1 WHERE id = $2',
      [response.embeddings[i], entries[i].id]
    );
  }
}
```

### Free Tier Limits
- 100 requests per minute
- 10,000 requests per month
- 1024 dimensions
- Batch size: up to 96 texts

---

## Context Building Strategy

### Full Context (Gemini)
```typescript
async build(userId: string, depth: AnalysisDepthMode): Promise<LumenContext> {
  // Gemini can handle 1M tokens - include everything
  const context: LumenContext = {
    analysisDepth: depth,
    user: await this.buildUserContext(userId, depth),
    members: await this.buildMembersContext(userId, depth),
    conversationHistory: await this.getFullHistory(userId),
  };

  return context;
}
```

### Light Context (Groq)
```typescript
async buildLight(userId: string, depth: AnalysisDepthMode): Promise<LumenContext> {
  // Groq has 128k limit - be selective
  const context: LumenContext = {
    analysisDepth: depth,
    user: await this.buildUserContextLight(userId, depth),
    members: await this.buildRecentMembersContext(userId, depth, 3), // Only 3 most relevant
    conversationHistory: await this.getRecentHistory(userId, 10), // Last 10 messages
  };

  return context;
}
```

---

## Cost Monitoring

### Track Usage
```typescript
interface AIUsageMetrics {
  geminiRequests: number;
  geminiTokensIn: number;
  geminiTokensOut: number;
  groqRequests: number;
  groqTokensIn: number;
  groqTokensOut: number;
  cohereEmbeddings: number;
}

async trackUsage(
  userId: string,
  model: 'gemini' | 'groq' | 'cohere',
  tokensIn: number,
  tokensOut: number
): Promise<void> {
  await this.db.query(
    `
    INSERT INTO ai_usage_logs (user_id, model, tokens_in, tokens_out, created_at)
    VALUES ($1, $2, $3, $4, NOW())
    `,
    [userId, model, tokensIn, tokensOut]
  );
}
```

### Rate Limiting
```typescript
@Injectable()
export class AIRateLimiter {
  private geminiLimiter = new RateLimiter({ points: 15, duration: 60 });
  private groqLimiter = new RateLimiter({ points: 30, duration: 60 });
  private cohereLimiter = new RateLimiter({ points: 100, duration: 60 });

  async checkGemini(userId: string): Promise<boolean> {
    return this.geminiLimiter.consume(userId);
  }

  async checkGroq(userId: string): Promise<boolean> {
    return this.groqLimiter.consume(userId);
  }

  async checkCohere(userId: string): Promise<boolean> {
    return this.cohereLimiter.consume(userId);
  }
}
```

---

## Error Handling & Fallbacks

### Graceful Degradation
```typescript
async query(userId: string, query: string, mode: LumenMode): Promise<string> {
  try {
    // Try primary model first
    if (this.shouldUseSpeedLayer(mode, query)) {
      return await this.queryGroq(userId, query, mode);
    } else {
      return await this.queryGemini(userId, query, mode);
    }
  } catch (error) {
    // Fallback to alternative model
    if (error.code === 'RATE_LIMIT_EXCEEDED') {
      return this.shouldUseSpeedLayer(mode, query)
        ? await this.queryGemini(userId, query, mode) // Fallback to Gemini
        : await this.queryGroq(userId, query, mode);   // Fallback to Groq
    }
    
    throw new AIServiceException('AI service temporarily unavailable');
  }
}
```

---

## Testing

### Mock Services
```typescript
// Mock Gemini
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: { text: () => 'Mocked Gemini response' },
      }),
    }),
  })),
}));

// Mock Groq
jest.mock('groq-sdk', () => ({
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Mocked Groq response' } }],
        }),
      },
    },
  })),
}));

// Mock Cohere
jest.mock('cohere-ai', () => ({
  CohereClient: jest.fn().mockImplementation(() => ({
    embed: jest.fn().mockResolvedValue({
      embeddings: [[0.1, 0.2, 0.3]],
    }),
  })),
}));
```

---

## Migration from Claude (if needed)

If you previously used Claude, migration is straightforward:

```typescript
// Old Claude code
const response = await anthropic.messages.create({
  model: 'claude-3-5-sonnet',
  messages: [{ role: 'user', content: query }],
});

// New Gemini code
const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
const result = await model.generateContent(query);
const response = result.response.text();
```

System prompts and context building remain the same - just swap the API calls.
