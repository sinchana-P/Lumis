import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token for obtaining new access tokens',
    example: 'eyJhbGc...',
  })
  @IsString()
  @IsNotEmpty()
  refresh_token!: string;
}
