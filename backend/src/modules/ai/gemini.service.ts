import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const MODEL = 'gemini-flash-latest';
const REQUEST_OPTIONS = { apiVersion: 'v1beta' };

@Injectable()
export class GeminiService {
  private readonly genAI: GoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ai.gemini.apiKey')!;
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generate(prompt: string, maxTokens = 512): Promise<string> {
    const mdl = this.genAI.getGenerativeModel(
      { model: MODEL, generationConfig: { temperature: 0.7, maxOutputTokens: maxTokens } },
      REQUEST_OPTIONS,
    );
    const result = await mdl.generateContent(prompt);
    return result.response.text().trim();
  }

  async generateJSON(prompt: string, maxTokens = 800): Promise<unknown> {
    const mdl = this.genAI.getGenerativeModel(
      { model: MODEL, generationConfig: { temperature: 0.5, maxOutputTokens: maxTokens } },
      REQUEST_OPTIONS,
    );
    const fullPrompt = prompt + '\n\nReturn ONLY valid JSON. No markdown. No code fences. No explanation.';
    const result = await mdl.generateContent(fullPrompt);
    let text = result.response.text().trim();
    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    return JSON.parse(text);
  }

  async chat(
    systemPrompt: string,
    history: ChatMessage[],
    userMessage: string,
    maxTokens = 1024,
  ): Promise<string> {
    const mdl = this.genAI.getGenerativeModel(
      { model: MODEL, systemInstruction: systemPrompt, generationConfig: { temperature: 0.75, maxOutputTokens: maxTokens } },
      REQUEST_OPTIONS,
    );

    const geminiHistory = history.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const chat = mdl.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(userMessage);
    return result.response.text().trim();
  }

  async *chatStream(
    systemPrompt: string,
    history: ChatMessage[],
    userMessage: string,
  ): AsyncGenerator<string> {
    const mdl = this.genAI.getGenerativeModel(
      { model: MODEL, systemInstruction: systemPrompt, generationConfig: { temperature: 0.75, maxOutputTokens: 1024 } },
      REQUEST_OPTIONS,
    );

    const geminiHistory = history.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const chat = mdl.startChat({ history: geminiHistory });
    const result = await chat.sendMessageStream(userMessage);
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield text;
    }
  }

  async generateReport(systemPrompt: string, userPrompt: string, maxTokens = 2048): Promise<string> {
    const mdl = this.genAI.getGenerativeModel(
      { model: MODEL, systemInstruction: systemPrompt, generationConfig: { temperature: 0.7, maxOutputTokens: maxTokens } },
      REQUEST_OPTIONS,
    );
    const chat = mdl.startChat({ history: [] });
    const result = await chat.sendMessage(userPrompt);
    return result.response.text().trim();
  }
}
