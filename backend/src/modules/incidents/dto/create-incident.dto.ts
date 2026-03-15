import { IsString, IsNotEmpty, IsOptional, IsDateString, IsArray, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateIncidentDto {
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

  @ApiPropertyOptional({ enum: ['conflict', 'breakthrough', 'milestone', 'challenge', 'celebration'] })
  @IsOptional()
  @IsString()
  @IsIn(['conflict', 'breakthrough', 'milestone', 'challenge', 'celebration'])
  category?: string;

  @ApiPropertyOptional({ enum: ['low', 'medium', 'high'] })
  @IsOptional()
  @IsString()
  @IsIn(['low', 'medium', 'high'])
  severity?: string;

  @ApiPropertyOptional({ description: 'Resolution or reflection on the incident' })
  @IsOptional()
  @IsString()
  outcome?: string;

  @ApiPropertyOptional({ type: [String], description: 'Emotion tags e.g. frustrated, joyful' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  emotions?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Searchable tags: mood:happy, theme:trust, context:work' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  tags?: string[];
}
