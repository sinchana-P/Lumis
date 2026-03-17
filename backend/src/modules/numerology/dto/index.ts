import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CalculateNumerologyDto {
  @IsString()
  @IsNotEmpty()
  dob: string; // "YYYY-MM-DD"

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsOptional()
  memberId?: string;

  @IsString()
  @IsOptional()
  memberRelation?: string;

  @IsString()
  @IsOptional()
  memberDob?: string; // for compatibility

  @IsString()
  @IsOptional()
  memberFullName?: string; // for compatibility
}
