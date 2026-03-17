import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../common/modules/supabase.module';
import { AstrologyController } from './astrology.controller';
import { AstrologyService } from './astrology.service';
import { AstrologyEngineService } from './astrology-engine.service';
import { AstrologyInterpreterService } from './astrology-interpreter.service';

@Module({
  imports: [SupabaseModule],
  controllers: [AstrologyController],
  providers: [AstrologyService, AstrologyEngineService, AstrologyInterpreterService],
  exports: [AstrologyService, AstrologyEngineService, AstrologyInterpreterService],
})
export class AstrologyModule {}
