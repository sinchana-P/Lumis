import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../common/modules/supabase.module';
import { NumerologyModule } from '../numerology/numerology.module';
import { LumenController } from './lumen.controller';
import { LumenService } from './lumen.service';
import { VectorMemoryService } from './vector-memory.service';
import { ContextBuilderService } from './context-builder.service';

@Module({
  imports: [SupabaseModule, NumerologyModule],
  controllers: [LumenController],
  providers: [LumenService, VectorMemoryService, ContextBuilderService],
  exports: [LumenService, VectorMemoryService, ContextBuilderService],
})
export class LumenModule {}
