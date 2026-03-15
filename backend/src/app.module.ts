import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { MembersModule } from './modules/members/members.module';
import { TraitsModule } from './modules/traits/traits.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { PatternsModule } from './modules/patterns/patterns.module';
import { InteractionsModule } from './modules/interactions/interactions.module';
import { SupabaseModule } from './common/modules/supabase.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),
    SupabaseModule,
    AuthModule,
    MembersModule,
    TraitsModule,
    IncidentsModule,
    PatternsModule,
    InteractionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
