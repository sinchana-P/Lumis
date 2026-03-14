import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RelationType } from './create-member.dto';

export class MembersQueryDto {
  @ApiPropertyOptional({ description: 'Filter by relation type', enum: RelationType })
  @IsOptional()
  @IsEnum(RelationType)
  relationType?: RelationType;

  @ApiPropertyOptional({ description: 'Search by name' })
  @IsOptional()
  search?: string;
}