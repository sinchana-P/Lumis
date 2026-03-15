import { IsOptional, IsString, IsArray, IsIn, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class InteractionsQueryDto {
  @ApiPropertyOptional({ enum: ['call', 'text', 'in-person', 'video', 'email', 'social'] })
  @IsOptional()
  @IsString()
  @IsIn(['call', 'text', 'in-person', 'video', 'email', 'social'])
  type?: string;

  @ApiPropertyOptional({ enum: ['excellent', 'good', 'neutral', 'poor', 'difficult'] })
  @IsOptional()
  @IsString()
  @IsIn(['excellent', 'good', 'neutral', 'poor', 'difficult'])
  quality?: string;

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
