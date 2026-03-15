import { IsString, IsNotEmpty, IsOptional, IsUUID, IsInt, Min, Max, IsArray, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export type TraitCategory = 'strength' | 'shadow' | 'trigger' | 'need' | 'pattern' | 'pro' | 'con';

export class CreateTraitDto {
  @ApiPropertyOptional({ description: 'Member ID (omit for user self-traits)' })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @ApiProperty({
    description: 'Trait category',
    enum: ['strength', 'shadow', 'trigger', 'need', 'pattern', 'pro', 'con'],
  })
  @IsString()
  @IsIn(['strength', 'shadow', 'trigger', 'need', 'pattern', 'pro', 'con'])
  category: TraitCategory;

  @ApiProperty({ description: 'Trait description text' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ description: 'Intensity: 1=mild, 2=moderate, 3=strong', minimum: 1, maximum: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  intensity?: number;

  @ApiPropertyOptional({ description: 'Primary emotion tag (e.g. joyful, anxious, frustrated)' })
  @IsOptional()
  @IsString()
  emotionTag?: string;

  @ApiPropertyOptional({
    description: 'Searchable tags with prefix format: mood:happy, theme:trust, context:work, emotion:frustrated',
    type: [String],
    example: ['mood:joyful', 'theme:humor', 'context:social'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') return [value];
    return value;
  })
  tags?: string[];
}
