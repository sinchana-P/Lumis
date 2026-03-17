import { Module } from '@nestjs/common';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { SupabaseModule } from '../../common/modules/supabase.module';
import { LumenModule } from '../lumen/lumen.module';

@Module({
  imports: [SupabaseModule, LumenModule],
  controllers: [IncidentsController],
  providers: [IncidentsService],
  exports: [IncidentsService],
})
export class IncidentsModule {}
