import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthModule } from '../../modules/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class GuardsModule {}
