---
inclusion: fileMatch
fileMatchPattern: "**/lumen/**/*.{ts,tsx}"
---

# Lumis AI Integration Guide

## AI Integration

### Service Architecture
```typescript
@Injectable()
export class LumenService {
  constructor(
    private readonly gemini: GoogleGenerativeAI,
    private readonly groq: Groq,
    private readonly cohere: CohereClient,
    private readonly contextBuilder: ContextBuilderService,
    private readonly conversationRepo: ConversationRepository,
  ) {}

  async query(userId: string, query: string, mode: LumenMode): Promise<string> {
    // Route to appropriate model
    const useSpeedLayer = this.shouldUseSpeedLayer(mode, query);
    
    if (useSpeedLayer) {
      return this.queryGroq(userId, query, mode); // Instant responses
    } else {
      return this.queryGemini(userId, query, mode); // Deep analysis
    }
  }
  
  private shouldUseSpeedLayer(mode: LumenMode, query: string): boolean {
    // Use Groq for speed-critical interactions
    if (mode === 'vent') return true;
    if (query.length < 100) return true;
    
    // Use Gemini for deep analysis
    if (mode === 'analysis' || mode === 'advice') return false;
    
    return mode === 'guided';
  }
}
```

### Model Selection Strategy

**Gemini 1.5 Flash (Primary - Deep Analysis)**
- AI Self Reports
- AI Relationship Reports
- Deep analysis queries
- Weekly digests
- Full Spectrum mode with large context
- 1,000,000 token context window

**Groq + Llama 3.1 70B (Speed Layer - Instant)**
- Vent mode (needs instant empathy)
- Quick mood queries
- Daily check-in responses
- Short pattern alerts
- Real-time chat
- 500+ tokens/second

**Cohere (Embeddings)**
- Journal semantic search
- Trait similarity matching
- Finding related incidents/patterns

### Context Building
```typescript
type AnalysisDepthMode = 'cosmic' | 'behavioral' | 'full-spectrum';

interface LumenContext {
  analysisDepth: AnalysisDepthMode;
  user: {
    profile: UserProfile;
    numerology?: NumerologyData; // Only if cosmic or full-spectrum
    astrology?: AstrologyData; // Only if cosmic or full-spectrum
    traits?: Trait[]; // Only if behavioral or full-spectrum
  };
  members: Array<{
    profile: MemberProfile;
    numerology?: NumerologyData; // Only if cosmic or full-spectrum
    astrology?: AstrologyData; // Only if cosmic or full-spectrum
    traits?: Trait[]; // Only if behavioral or full-spectrum
    recentIncidents?: Incident[]; // Only if behavioral or full-spectrum
    recentInteractions?: Interaction[]; // Only if behavioral or full-spectrum
  }>;
  recentMoodCheckIns?: MoodCheckIn[]; // Only if behavioral or full-spectrum
  conversationHistory: Message[];
}

// Context builder respects analysis depth mode
const buildContext = async (
  userId: string,
  analysisDepth: AnalysisDepthMode
): Promise<LumenContext> => {
  const context: LumenContext = {
    analysisDepth,
    user: { profile: await getUserProfile(userId) },
    members: [],
    conversationHistory: [],
  };

  // Add cosmic data if needed
  if (analysisDepth === 'cosmic' || analysisDepth === 'full-spectrum') {
    context.user.numerology = await getNumerology(userId);
    context.user.astrology = await getAstrology(userId);
  }

  // Add behavioral data if needed
  if (analysisDepth === 'behavioral' || analysisDepth === 'full-spectrum') {
    context.user.traits = await getUserTraits(userId);
    context.recentMoodCheckIns = await getMoodCheckIns(userId);
  }

  return context;
};
```

### System Prompts by Mode

#### Vent Mode
```
You are Lumen, a compassionate AI companion. The user needs to vent.
Your role: LISTEN ONLY. Do not analyze, advise, or interpret unless explicitly asked.
Respond with empathy and validation. Keep responses brief and supportive.
```

#### Guided Mode
```
You are Lumen, a psychology-trained AI guide. Help the user explore their feelings.
Ask thoughtful questions to deepen their self-reflection.
Use attachment theory, cognitive distortions, and emotional regulation frameworks.
```

#### Analysis Mode
```
You are Lumen, an analytical AI psychologist. Provide deep insights.
Cross-reference numerology, astrology, and observed behavioral data.
Identify patterns, dynamics, and underlying psychological mechanisms.
```

#### Advice Mode
```
You are Lumen, a practical AI advisor. Give actionable guidance.
Use Non-Violent Communication (NVC) framework.
Suggest specific actions, scripts, and timing based on numerology/astrology.
```

#### Timing Mode
```
You are Lumen, a timing specialist. Analyze numerological and astrological data.
Provide guidance on: best days for connection, difficult conversations, or space.
Consider both user and member Personal Year/Month cycles and current transits.
```

---

## AI Analysis Depth Modes

Users can control what data sources Lumen uses for analysis. This affects ALL Lumen interactions.

### Three Analysis Depth Modes

#### 1. COSMIC MODE (Numerology + Astrology Only)
**What Lumen Uses:**
- User's numerology blueprint (Life Path, Soul Urge, Personal Year, etc.)
- User's astrology natal chart and transits
- Member's numerology blueprint
- Member's astrology natal chart and transits
- Compatibility calculations based on cosmic data

**What Lumen Ignores:**
- Logged traits (pros/cons, strengths/shadows)
- Incidents, patterns, interactions
- Journal entries
- Mood check-ins

**Use Case:** Users who want purely cosmic/spiritual insights without behavioral analysis

**System Prompt Addition:**
```
ANALYSIS DEPTH: COSMIC MODE
You have access ONLY to numerology and astrology data.
Do NOT reference logged traits, incidents, patterns, or interactions.
Base all insights on cosmic blueprints, cycles, and transits.
```

#### 2. BEHAVIORAL MODE (Logged Data Only)
**What Lumen Uses:**
- User's self traits (strengths, shadows, triggers, needs, patterns)
- Member's pros/cons with intensity and emotion tags
- All logged incidents with dates and emotional impact
- All logged patterns
- All interactions with mood before/after
- Journal entries
- Mood check-ins

**What Lumen Ignores:**
- Numerology data
- Astrology data
- Cosmic compatibility

**Use Case:** Users who want purely evidence-based psychological analysis without spiritual elements

**System Prompt Addition:**
```
ANALYSIS DEPTH: BEHAVIORAL MODE
You have access ONLY to logged behavioral data.
Do NOT reference numerology, astrology, or cosmic influences.
Base all insights on observed traits, incidents, patterns, and interactions.
Use psychology frameworks: attachment theory, cognitive distortions, NVC.
```

#### 3. FULL SPECTRUM MODE (Everything - Default)
**What Lumen Uses:**
- ALL numerology data
- ALL astrology data
- ALL logged behavioral data
- ALL journal entries and mood check-ins
- Complete cross-referencing between cosmic and behavioral layers

**Use Case:** Users who want the deepest, most comprehensive analysis

**System Prompt Addition:**
```
ANALYSIS DEPTH: FULL SPECTRUM MODE
You have access to ALL data: numerology, astrology, AND logged behavioral data.
Cross-reference cosmic blueprints with observed patterns.
Identify where cosmic tendencies manifest in actual behavior.
Provide the most comprehensive, multi-layered insights.
```

## Psychology Frameworks

### Attachment Theory
- Secure: comfortable with intimacy and independence
- Anxious: fears abandonment, seeks reassurance
- Avoidant: values independence, uncomfortable with closeness
- Fearful-Avoidant: wants closeness but fears hurt

### Cognitive Distortions
- Catastrophizing: expecting worst-case scenarios
- Mind-reading: assuming you know what others think
- Personalization: taking things personally
- Black-and-white thinking: all-or-nothing perspective

### Emotional Regulation
- Window of tolerance: optimal arousal zone
- Co-regulation: calming through connection
- Self-soothing: managing emotions independently

## Token Management

### Optimization Strategies
- Summarize old conversation history
- Include only relevant member data
- Truncate long journal entries
- Use structured data format

### Token Limits
- Claude 3.5 Sonnet: 200k input, 8k output
- Target: keep context under 50k tokens
- Monitor usage per request

## Streaming Responses

### Implementation
```typescript
async streamQuery(userId: string, query: string): Promise<ReadableStream> {
  const stream = await this.anthropic.messages.stream({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    messages: [{ role: 'user', content: query }],
  });

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta') {
          controller.enqueue(chunk.delta.text);
        }
      }
      controller.close();
    },
  });
}
```

## Error Handling

### API Errors
```typescript
try {
  const response = await this.gemini.generateContent(...);
} catch (error) {
  if (error.status === 429) {
    throw new RateLimitException('AI service rate limit exceeded');
  }
  if (error.status === 500) {
    throw new AIServiceException('AI service temporarily unavailable');
  }
  throw new AIServiceException('Failed to process query');
}
```

### Fallback Strategy
```typescript
async query(userId: string, query: string, mode: LumenMode): Promise<string> {
  try {
    // Try primary model
    return this.shouldUseSpeedLayer(mode, query)
      ? await this.queryGroq(userId, query, mode)
      : await this.queryGemini(userId, query, mode);
  } catch (error) {
    // Fallback to alternative model
    if (error.code === 'RATE_LIMIT_EXCEEDED') {
      return this.shouldUseSpeedLayer(mode, query)
        ? await this.queryGemini(userId, query, mode) // Fallback to Gemini
        : await this.queryGroq(userId, query, mode);   // Fallback to Groq
    }
    throw error;
  }
}
```

### Fallback Responses
- If AI fails, return graceful error message
- Suggest trying again or using different mode
- Never expose API errors to user

## Report Generation

### Self Report
```typescript
async generateSelfReport(userId: string): Promise<AIReport> {
  const context = await this.contextBuilder.buildSelfContext(userId);
  
  const prompt = `
    Analyze this person's psychological profile:
    ${JSON.stringify(context, null, 2)}
    
    Provide:
    1. Attachment style (secure/anxious/avoidant/fearful-avoidant)
    2. Emotional trigger map (what affects them and why)
    3. Relationship patterns (recurring dynamics)
    
    Be specific, compassionate, and actionable.
  `;
  
  // Use Gemini for deep analysis with full context
  const response = await this.queryGemini(userId, prompt, 'analysis');
  return this.parseAndSaveReport(userId, response, 'self');
}
```

### Relationship Report
```typescript
async generateRelationshipReport(userId: string, memberId: string): Promise<AIReport> {
  const context = await this.contextBuilder.buildRelationshipContext(userId, memberId);
  
  const prompt = `
    Analyze the relationship between these two people:
    ${JSON.stringify(context, null, 2)}
    
    Provide:
    1. Compatibility score (0-100) with reasoning
    2. Relationship dynamic type
    3. Tension points (where they clash)
    4. Growth points (what they bring out in each other)
    5. Forecast (based on Personal Year cycles)
    6. Timing guidance (best times for connection/difficult conversations)
  `;
  
  // Use Gemini for comprehensive analysis
  const response = await this.queryGemini(userId, prompt, 'analysis');
  return this.parseAndSaveReport(userId, response, 'relationship', memberId);
}
```

### Semantic Journal Search
```typescript
async searchJournal(userId: string, query: string): Promise<JournalEntry[]> {
  // Generate query embedding with Cohere
  const queryEmbedding = await this.cohere.embed({
    texts: [query],
    model: 'embed-english-v3.0',
    inputType: 'search_query',
  });

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
    LIMIT 10
    `,
    [queryEmbedding.embeddings[0], userId]
  );

  return results.rows;
}
```

## Conversation Memory

### Storage Strategy
- Store full conversation history
- Summarize after 20 messages
- Keep last 10 messages + summary
- Include summary in context

### Context Window Management
```typescript
private async buildConversationContext(conversationId: string): Promise<Message[]> {
  const messages = await this.conversationRepo.getMessages(conversationId);
  
  if (messages.length <= 10) {
    return messages;
  }
  
  const summary = await this.summarizeMessages(messages.slice(0, -10));
  const recentMessages = messages.slice(-10);
  
  return [
    { role: 'assistant', content: `Previous conversation summary: ${summary}` },
    ...recentMessages,
  ];
}
```

## Testing AI Integration

### Mock Responses
```typescript
jest.mock('@anthropic-ai/sdk', () => ({
  Anthropic: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{ text: 'Mocked AI response' }],
      }),
    },
  })),
}));
```

### Integration Tests
- Test with real APIs in staging
- Monitor response quality across both models
- Track token usage (Gemini vs Groq)
- Measure latency (Groq should be <1s, Gemini <3s)
- Test fallback mechanisms

## Monitoring & Analytics

### Track Metrics
- Queries per user per day (by model)
- Average response time (Gemini vs Groq)
- Token usage per query (both models)
- Error rate (by model)
- Mode distribution (which modes use which models)
- Fallback frequency
- Cohere embedding requests

### Quality Assurance
- Review sample responses weekly
- Collect user feedback
- Iterate on prompts
- A/B test system prompts
