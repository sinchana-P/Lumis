import { Module } from '@nestjs/common';
import { TraitsController } from './traits.controller';
import { TraitsService } from './traits.service';
import { SupabaseModule } from '../../common/modules/supabase.module';
import { LumenModule } from '../lumen/lumen.module';

@Module({
  imports: [SupabaseModule, LumenModule],
  controllers: [TraitsController],
  providers: [TraitsService],
  exports: [TraitsService],
})
export class TraitsModule {}
