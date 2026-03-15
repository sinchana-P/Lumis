import { IsOptional, IsString, IsUUID, IsArray, IsIn, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class TraitsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by member ID (omit for user self-traits)' })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @ApiPropertyOptional({
    description: 'Filter by category',
    enum: ['strength', 'shadow', 'trigger', 'need', 'pattern', 'pro', 'con'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['strength', 'shadow', 'trigger', 'need', 'pattern', 'pro', 'con'])
  category?: string;

  @ApiPropertyOptional({
    description: 'Filter by tags (AND logic). Format: mood:happy, theme:trust, context:work',
    type: [String],
    example: ['mood:happy', 'theme:trust'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') return [value];
    return value;
  })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 50;
}
