import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { ChatMessage } from './gemini.service';

@Injectable()
export class GroqService {
  private readonly client: Groq;
  private readonly MODEL = 'llama-3.3-70b-versatile';

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ai.groq.apiKey')!;
    this.client = new Groq({ apiKey });
  }

  async chat(
    systemPrompt: string,
    history: ChatMessage[],
    userMessage: string,
    maxTokens = 512,
  ): Promise<string> {
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user' as const, content: userMessage },
    ];

    const res = await this.client.chat.completions.create({
      model: this.MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.8,
    });

    return res.choices[0].message.content || '';
  }

  async *chatStream(
    systemPrompt: string,
    history: ChatMessage[],
    userMessage: string,
  ): AsyncGenerator<string> {
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user' as const, content: userMessage },
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
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7,
    });
    return res.choices[0].message.content || '';
  }
}
