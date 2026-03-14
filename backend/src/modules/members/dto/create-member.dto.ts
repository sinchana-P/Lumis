import { IsString, IsOptional, IsEnum, ValidateIf, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum RelationType {
  FRIEND = 'friend',
  FAMILY = 'family',
  COLLEAGUE = 'colleague',
  PARTNER = 'partner',
  ACQUAINTANCE = 'acquaintance',
  BOSS = 'boss',
  MENTOR = 'mentor',
  THERAPIST = 'therapist',
  COACH = 'coach',
  TEACHER = 'teacher',
  STUDENT = 'student',
  NEIGHBOR = 'neighbor',
  EX_PARTNER = 'ex-partner',
  OTHER = 'other',
}

export class CreateMemberDto {
  @ApiProperty({ description: 'Full name of the member' })
  @IsString()
  fullName!: string;

  @ApiPropertyOptional({ description: 'Nickname or preferred name' })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiPropertyOptional({ description: 'Date of birth (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'Time of birth (HH:MM)' })
  @IsOptional()
  @IsString()
  timeOfBirth?: string;

  @ApiPropertyOptional({ description: 'Place of birth' })
  @IsOptional()
  @IsString()
  placeOfBirth?: string;

  @ApiProperty({ description: 'Relationship type', enum: RelationType })
  @IsEnum(RelationType)
  relationType!: RelationType;

  @ApiPropertyOptional({ description: 'Custom relation type when relationType is "other"' })
  @ValidateIf(o => o.relationType === RelationType.OTHER)
  @IsString()
  @MaxLength(100)
  relationTypeCustom?: string;

  @ApiPropertyOptional({ description: 'Notes about this person' })
  @IsOptional()
  @IsString()
  notes?: string;
}