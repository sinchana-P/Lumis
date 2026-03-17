import { Global, Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GroqService } from './groq.service';
import { EmbeddingsService } from './embeddings.service';
import { ModelRouterService } from './model-router.service';
import { IntentClassifierService } from './intent-classifier.service';

@Global()
@Module({
  providers: [
    GeminiService,
    GroqService,
    EmbeddingsService,
    ModelRouterService,
    IntentClassifierService,
  ],
  exports: [
    GeminiService,
    GroqService,
    EmbeddingsService,
    ModelRouterService,
    IntentClassifierService,
  ],
})
export class AiModule {}
