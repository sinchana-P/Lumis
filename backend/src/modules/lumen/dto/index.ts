import { IsString, IsArray, IsEnum, IsOptional, IsNotEmpty, IsUUID } from 'class-validator';
import { LumenMode, AnalysisDepth, ChatMessage } from '../lumen-types';

export class LumenChatDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsEnum(['VENT', 'GUIDED', 'ANALYSIS', 'ADVICE', 'TIMING'])
  mode: LumenMode;

  @IsEnum(['FULL_SPECTRUM', 'COSMIC', 'BEHAVIORAL'])
  depth: AnalysisDepth;

  @IsArray()
  @IsOptional()
  memberIds?: string[];

  @IsArray()
  @IsOptional()
  history?: ChatMessage[];

  @IsUUID()
  @IsOptional()
  conversationId?: string;
}

export class RelationshipReportDto {
  @IsEnum(['FULL_SPECTRUM', 'COSMIC', 'BEHAVIORAL'])
  @IsOptional()
  depth?: AnalysisDepth;
}
