import { IsArray, IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

/**
 * Cross-entity tag search — returns matching traits, incidents, patterns, etc.
 * filtered by shared tag keys like mood:happy, theme:trust, context:work.
 */
export class TagSearchQueryDto {
  @ApiProperty({
    description: 'Tags to search for across all entities. Format: prefix:value (e.g. mood:happy)',
    type: [String],
    example: ['mood:happy', 'theme:trust'],
  })
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') return [value];
    return value;
  })
  tags: string[];

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
