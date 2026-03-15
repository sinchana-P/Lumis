import { IsString, IsNotEmpty, IsOptional, IsArray, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreatePatternDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ enum: ['communication', 'conflict', 'affection', 'decision-making', 'stress-response', 'social'] })
  @IsOptional()
  @IsString()
  @IsIn(['communication', 'conflict', 'affection', 'decision-making', 'stress-response', 'social'])
  category?: string;

  @ApiPropertyOptional({ enum: ['rare', 'occasional', 'frequent', 'constant'] })
  @IsOptional()
  @IsString()
  @IsIn(['rare', 'occasional', 'frequent', 'constant'])
  frequency?: string;

  @ApiPropertyOptional({ enum: ['positive', 'neutral', 'negative'] })
  @IsOptional()
  @IsString()
  @IsIn(['positive', 'neutral', 'negative'])
  impact?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  triggers?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  examples?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Searchable tags: theme:trust, context:work' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  tags?: string[];
}
