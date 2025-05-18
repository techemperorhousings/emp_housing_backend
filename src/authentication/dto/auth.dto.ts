import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthDto {
  @ApiProperty({
    description: 'Email',
    example: 'testuser@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    description: 'First Name',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  readonly firstname: string;

  @ApiProperty({
    description: 'Last Name',
    example: 'Doe',
  })
  @IsNotEmpty()
  @IsString()
  readonly lastname: string;

  @ApiProperty({
    description: 'Phone Number',
    example: '+1234567890',
  })
  @IsString()
  @IsNotEmpty()
  readonly phoneNumber: string;

  @ApiProperty({
    description: 'Password',
    example: 'P@ssword123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  readonly password: string;

  @ApiProperty({
    description: 'Profile Image Url',
    example: 'https://example.com/image.jpg',
  })
  @IsNotEmpty()
  @IsString()
  readonly profileImage: string;

  @ApiProperty({
    description: 'Role ID',
    example: '1234567890abcdef12345678',
  })
  @IsNotEmpty()
  @IsString()
  readonly roleId: string;
}
