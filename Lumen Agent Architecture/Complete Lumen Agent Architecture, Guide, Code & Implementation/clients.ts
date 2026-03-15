// ═══════════════════════════════════════════════════════════════
// LUMIS AI — AI CLIENTS
// Gemini, Groq, Cohere — all in one file.
// ═══════════════════════════════════════════════════════════════

import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { CohereClient } from "cohere-ai";
import { ChatMessage } from "../types";

// ──────────────────────────────────────────────────────────────
// GEMINI CLIENT
// Primary model for: deep analysis, interpretation, reports
// ──────────────────────────────────────────────────────────────
export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    });
  }

  // Single-turn generation (for interpretation sections)
  async generate(prompt: string, maxTokens = 512): Promise<string> {
    const mdl = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { temperature: 0.7, maxOutputTokens: maxTokens },
    });
    const result = await mdl.generateContent(prompt);
    return result.response.text().trim();
  }

  // Returns parsed JSON (strips markdown fences)
  async generateJSON(prompt: string, maxTokens = 800): Promise<unknown> {
    const mdl = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { temperature: 0.5, maxOutputTokens: maxTokens },
    });
    const fullPrompt = prompt + "\n\nReturn ONLY valid JSON. No markdown. No code fences. No explanation.";
    const result = await mdl.generateContent(fullPrompt);
    let text = result.response.text().trim();
    text = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    return JSON.parse(text);
  }

  // Multi-turn chat (for Lumen conversation)
  async chat(systemPrompt: string, history: ChatMessage[], userMessage: string, maxTokens = 1024): Promise<string> {
    const mdl = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt,
      generationConfig: { temperature: 0.75, maxOutputTokens: maxTokens },
    });

    const geminiHistory = history.slice(0, -1).map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const chat = mdl.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(userMessage);
    return result.response.text().trim();
  }

  // Streaming chat (for Lumen conversation with real-time output)
  async *chatStream(systemPrompt: string, history: ChatMessage[], userMessage: string): AsyncGenerator<string> {
    const mdl = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt,
      generationConfig: { temperature: 0.75, maxOutputTokens: 1024 },
    });

    const geminiHistory = history.slice(0, -1).map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const chat = mdl.startChat({ history: geminiHistory });
    const result = await chat.sendMessageStream(userMessage);
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield text;
    }
  }

  // Large context (for reports with full member data)
  async generateReport(systemPrompt: string, userPrompt: string, maxTokens = 2048): Promise<string> {
    const mdl = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt,
      generationConfig: { temperature: 0.7, maxOutputTokens: maxTokens },
    });
    const chat = mdl.startChat({ history: [] });
    const result = await chat.sendMessage(userPrompt);
    return result.response.text().trim();
  }
}

// ──────────────────────────────────────────────────────────────
// GROQ CLIENT
// Speed layer: vent mode, quick queries, check-ins
// Target latency: <1 second
// ──────────────────────────────────────────────────────────────
export class GroqClient {
  private client: Groq;
  private readonly MODEL = "llama-3.1-70b-versatile";

  constructor(apiKey: string) {
    this.client = new Groq({ apiKey });
  }

  async chat(systemPrompt: string, history: ChatMessage[], userMessage: string, maxTokens = 512): Promise<string> {
    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...history.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user" as const, content: userMessage },
    ];

    const res = await this.client.chat.completions.create({
      model: this.MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.8,
    });

    return res.choices[0].message.content || "";
  }

  async *chatStream(systemPrompt: string, history: ChatMessage[], userMessage: string): AsyncGenerator<string> {
    const messages = [
      { role: "system" as const, content: systemPrompt },
      ...history.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user" as const, content: userMessage },
    ];

    const stream = await this.client.chat.completions.create({
      model: this.MODEL,
      messages,
      max_tokens: 512,
      temperature: 0.8,
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) yield text;
    }
  }

  async quickGenerate(prompt: string, maxTokens = 256): Promise<string> {
    const res = await this.client.chat.completions.create({
      model: this.MODEL,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7,
    });
    return res.choices[0].message.content || "";
  }
}

// ──────────────────────────────────────────────────────────────
// COHERE EMBEDDINGS CLIENT
// Used for: journal search, trait similarity, memory retrieval
// ──────────────────────────────────────────────────────────────
export class EmbeddingsClient {
  private client: CohereClient;
  private readonly MODEL = "embed-english-v3.0";

  constructor(apiKey: string) {
    this.client = new CohereClient({ token: apiKey });
  }

  // Embed a search query
  async embedQuery(text: string): Promise<number[]> {
    const res = await this.client.embed({
      texts: [text],
      model: this.MODEL,
      inputType: "search_query",
    });
    return (res.embeddings as number[][])[0];
  }

  // Embed documents for storage
  async embedDocuments(texts: string[]): Promise<number[][]> {
    if (!texts.length) return [];
    const res = await this.client.embed({
      texts,
      model: this.MODEL,
      inputType: "search_document",
    });
    return res.embeddings as number[][];
  }

  // Batch embed in chunks (Cohere limit: 96 per request)
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

  // Cosine similarity
  static cosineSim(a: number[], b: number[]): number {
    const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
    const magA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
    const magB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
    if (magA === 0 || magB === 0) return 0;
    return dot / (magA * magB);
  }
}

// ──────────────────────────────────────────────────────────────
// MODEL ROUTER
// Decides which model handles a given request type
// ──────────────────────────────────────────────────────────────
export type ModelChoice = "gemini" | "groq";

export function routeModel(mode: string): ModelChoice {
  const GROQ_MODES = ["VENT", "GUIDED"];
  return GROQ_MODES.includes(mode.toUpperCase()) ? "groq" : "gemini";
}

// ──────────────────────────────────────────────────────────────
// INTENT CLASSIFIER
// Rule-based + keyword detection. Fast, no API call.
// ──────────────────────────────────────────────────────────────
export type IntentType =
  | "vent"
  | "mood_query"
  | "person_deep_dive"
  | "pattern_analysis"
  | "conflict_analysis"
  | "comparison"
  | "timing"
  | "advice"
  | "report"
  | "general";

export function classifyIntent(prompt: string): IntentType {
  const p = prompt.toLowerCase();

  // Vent signals
  if (/\b(feel|feeling|upset|frustrated|angry|hurt|sad|anxious|overwhelmed|confused|tired|exhausted|drained)\b/.test(p) &&
      !/why|how|what/.test(p.substring(0, 20))) return "vent";

  // Timing
  if (/\b(timing|good time|right time|approach|reach out|contact|this week|today|now|should i)\b/.test(p) &&
      /\b(when|week|month|day|tonight|tomorrow)\b/.test(p)) return "timing";

  // Conflict
  if (/\b(argument|fight|conflict|argue|disagreement|tension)\b/.test(p)) return "conflict_analysis";

  // Comparison
  if (/\b(compare|vs|versus|who|between|difference)\b/.test(p)) return "comparison";

  // Pattern
  if (/\b(pattern|keep|always|never|repeat|why do i|why do they|attract)\b/.test(p)) return "pattern_analysis";

  // Person deep dive
  if (/\b(why does|why do|why is|understand|explain|help me understand)\b/.test(p) &&
      /\b(they|them|he|she|this person)\b/.test(p)) return "person_deep_dive";

  // Advice
  if (/\b(how should|what should|what can|help me|tell me how|what to)\b/.test(p)) return "advice";

  // Report
  if (/\b(report|full analysis|everything|overview|complete)\b/.test(p)) return "report";

  // Mood query
  if (/\b(feel|feeling|heavy|drained|anxious|after|spoke|talked|call|conversation)\b/.test(p)) return "mood_query";

  return "general";
}
