import { Module } from '@nestjs/common';
import { JournalController } from './journal.controller';
import { JournalService } from './journal.service';
import { SupabaseModule } from '../../common/modules/supabase.module';
import { LumenModule } from '../lumen/lumen.module';

@Module({
  imports: [SupabaseModule, LumenModule],
  controllers: [JournalController],
  providers: [JournalService],
})
export class JournalModule {}
