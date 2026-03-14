import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleCallbackDto {
  @ApiProperty({
    description: 'Authorization code from Google OAuth callback',
    example: '4/0AY0e-g7X...',
  })
  @IsString()
  @IsNotEmpty()
  code!: string;
}
