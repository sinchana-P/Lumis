import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../common/modules/supabase.module';
import { NumerologyController } from './numerology.controller';
import { NumerologyService } from './numerology.service';
import { NumerologyEngineService } from './numerology-engine.service';
import { NumerologyInterpreterService } from './numerology-interpreter.service';

@Module({
  imports: [SupabaseModule],
  controllers: [NumerologyController],
  providers: [NumerologyService, NumerologyEngineService, NumerologyInterpreterService],
  exports: [NumerologyService, NumerologyEngineService, NumerologyInterpreterService],
})
export class NumerologyModule {}
