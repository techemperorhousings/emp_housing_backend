import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'the verification token',
    example: '1234567890',
  })
  @IsNotEmpty()
  @IsString()
  readonly token: string;

  @ApiProperty({
    description: 'the user email',
    example: 'nanret@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}
