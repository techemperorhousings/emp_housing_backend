import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

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
  @MaxLength(60)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,60}$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
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
