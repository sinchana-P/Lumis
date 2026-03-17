import { Module } from '@nestjs/common';
import { InteractionsController } from './interactions.controller';
import { InteractionsService } from './interactions.service';
import { SupabaseModule } from '../../common/modules/supabase.module';
import { LumenModule } from '../lumen/lumen.module';

@Module({
  imports: [SupabaseModule, LumenModule],
  controllers: [InteractionsController],
  providers: [InteractionsService],
})
export class InteractionsModule {}
