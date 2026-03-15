import { Module } from '@nestjs/common';
import { TraitsController } from './traits.controller';
import { TraitsService } from './traits.service';
import { SupabaseModule } from '../../common/modules/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [TraitsController],
  providers: [TraitsService],
  exports: [TraitsService],
})
export class TraitsModule {}
