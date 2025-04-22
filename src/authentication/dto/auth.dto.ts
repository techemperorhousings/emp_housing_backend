import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AuthDto {
  @ApiProperty({
    description: 'Email',
    example: 'testuser@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    description: 'Full Name',
    example: 'John Doe',
  })
  @IsNotEmpty()
  readonly fullname: string;

  @ApiProperty({
    description: 'Phone Number',
    example: '+1234567890',
  })
  @IsString()
  @IsNotEmpty()
  readonly phoneNumber: string;

  @ApiProperty({
    description: 'Password',
    example: 'password',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  readonly password: string;

  @ApiProperty({
    description: 'Profile Image Url',
    example: 'https://example.com/image.jpg',
  })
  readonly profileImage: string;

  @ApiProperty({
    description: 'Role ID',
    example: '1234567890abcdef12345678',
  })
  readonly roleId: string;
}
