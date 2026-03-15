import { IsOptional, IsString, IsArray, IsIn, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class PatternsQueryDto {
  @ApiPropertyOptional({ enum: ['communication', 'conflict', 'affection', 'decision-making', 'stress-response', 'social'] })
  @IsOptional()
  @IsString()
  @IsIn(['communication', 'conflict', 'affection', 'decision-making', 'stress-response', 'social'])
  category?: string;

  @ApiPropertyOptional({ enum: ['positive', 'neutral', 'negative'] })
  @IsOptional()
  @IsString()
  @IsIn(['positive', 'neutral', 'negative'])
  impact?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (!value) return undefined;
    return typeof value === 'string' ? [value] : value;
  })
  tags?: string[];

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 50;
}
