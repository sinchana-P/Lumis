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
import { JournalModule } from './modules/journal/journal.module';
import { SeedModule } from './modules/seed/seed.module';
import { SupabaseModule } from './common/modules/supabase.module';
import { AiModule } from './modules/ai/ai.module';
import { NumerologyModule } from './modules/numerology/numerology.module';
import { AstrologyModule } from './modules/astrology/astrology.module';
import { LumenModule } from './modules/lumen/lumen.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { MethodologyModule } from './modules/methodology/methodology.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [configuration],
    }),
    SupabaseModule,
    AiModule,
    AuthModule,
    MembersModule,
    TraitsModule,
    IncidentsModule,
    PatternsModule,
    InteractionsModule,
    JournalModule,
    SeedModule,
    NumerologyModule,
    AstrologyModule,
    LumenModule,
    DashboardModule,
    MethodologyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
