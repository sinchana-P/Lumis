import { IsString, IsNotEmpty, IsOptional, IsDateString, IsArray, IsIn, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateInteractionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'ISO date string YYYY-MM-DD' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ enum: ['call', 'text', 'in-person', 'video', 'email', 'social'] })
  @IsOptional()
  @IsString()
  @IsIn(['call', 'text', 'in-person', 'video', 'email', 'social'])
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({ enum: ['excellent', 'good', 'neutral', 'poor', 'difficult'] })
  @IsOptional()
  @IsString()
  @IsIn(['excellent', 'good', 'neutral', 'poor', 'difficult'])
  quality?: string;

  @ApiPropertyOptional({ description: 'Mood/feeling before the interaction' })
  @IsOptional()
  @IsString()
  moodBefore?: string;

  @ApiPropertyOptional({ description: 'Mood/feeling after the interaction' })
  @IsOptional()
  @IsString()
  moodAfter?: string;

  @ApiPropertyOptional({ description: 'Energy level 1-10', minimum: 1, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  @Transform(({ value }) => parseInt(value, 10))
  energyLevel?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  topics?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Searchable tags: theme:trust, context:work' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  tags?: string[];
}
