import { IsOptional, IsString, IsIn, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ description: 'First name', required: false })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty({ description: 'Last name', required: false })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty({ description: 'Full name', required: false })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiProperty({ description: 'Date of birth (YYYY-MM-DD or empty string to clear)', required: false })
  @IsOptional()
  @IsString()
  date_of_birth?: string;

  @ApiProperty({ description: 'Time of birth or empty string to clear', required: false })
  @IsOptional()
  @IsString()
  time_of_birth?: string;

  @ApiProperty({ description: 'Place of birth', required: false })
  @IsOptional()
  @IsString()
  place_of_birth?: string;

  @ApiProperty({ description: 'Avatar URL or empty string to clear', required: false })
  @IsOptional()
  @IsString()
  avatar_url?: string;

  @ApiProperty({ description: 'Analysis depth mode', required: false })
  @IsOptional()
  @IsIn(['cosmic', 'behavioral', 'full-spectrum'])
  analysis_depth_mode?: string;
}