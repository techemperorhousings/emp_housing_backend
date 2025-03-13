import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { UserRole } from '@prisma/client';

export class AuthDto {
  @ApiProperty({
    description: 'Email',
    example: 'nanretgungshik@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    description: 'Username',
    example: 'nanret',
  })
  @IsNotEmpty()
  readonly username: string;

  @ApiProperty({
    description: 'First Name',
    example: 'Nanret',
  })
  @IsNotEmpty()
  readonly firstname: string;

  @ApiProperty({
    description: 'Last Name',
    example: 'John',
  })
  @IsNotEmpty()
  readonly lastname: string;

  @ApiProperty({
    description: 'Phone Number',
    example: '+1234567890',
  })
  @IsString()
  @IsNotEmpty()
  readonly phoneNumber: string;

  @ApiProperty({
    description: 'Profile Image URL',
    example: 'https://example.com/profile-image.jpg',
  })
  @IsString()
  @IsOptional()
  readonly profileImage: string;

  @ApiProperty({
    description: 'the role of the user',
    example: 'USER',
  })
  @IsOptional()
  @IsString()
  readonly role: UserRole;

  @ApiProperty({
    description: 'Password',
    example: 'Password@123',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  @MaxLength(60)
  readonly password: string;
}

export class UpdateUserDto extends PartialType(AuthDto) {}
