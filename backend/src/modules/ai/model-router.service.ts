import { Injectable } from '@nestjs/common';

export type ModelChoice = 'gemini' | 'groq';

@Injectable()
export class ModelRouterService {
  route(mode: string): ModelChoice {
    const GROQ_MODES = ['VENT', 'GUIDED'];
    return GROQ_MODES.includes(mode.toUpperCase()) ? 'groq' : 'gemini';
  }
}
