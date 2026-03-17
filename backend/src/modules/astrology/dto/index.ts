import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CalculateAstrologyDto {
  @IsString()
  @IsNotEmpty()
  dob: string; // "YYYY-MM-DD"

  @IsString()
  @IsNotEmpty()
  birthTime: string; // "HH:MM"

  @IsNumber()
  lat: number;

  @IsNumber()
  lon: number;

  @IsNumber()
  utcOffset: number;

  @IsString()
  @IsOptional()
  memberId?: string;

  @IsString()
  @IsOptional()
  memberRelation?: string;

  @IsString()
  @IsOptional()
  memberName?: string;
}

export class GeocodeDto {
  @IsString()
  @IsNotEmpty()
  place: string;
}
