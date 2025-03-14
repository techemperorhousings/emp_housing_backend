import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
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
    description: 'Username',
    example: 'Tester',
  })
  @IsNotEmpty()
  readonly username: string;

  @ApiProperty({
    description: 'First Name',
    example: 'Test',
  })
  @IsNotEmpty()
  readonly firstname: string;

  @ApiProperty({
    description: 'Last Name',
    example: 'Account',
  })
  @IsNotEmpty()
  readonly lastname: string;

  @ApiProperty({
    description: 'Date of Birth',
    example: '2000-01-01T00:00:00.000Z',
  })
  @IsDate()
  @IsNotEmpty()
  readonly dob: Date;

  @ApiProperty({
    description: 'Phone Number',
    example: '+1234567890',
  })
  @IsString()
  @IsNotEmpty()
  readonly phoneNumber: string;

  @ApiProperty({
    description: 'Address',
    example: '123 Main St',
  })
  @IsString()
  @IsNotEmpty()
  readonly address: string;

  @ApiProperty({
    description: 'Location',
    example: {
      lat: 'number',
      lng: 'number',
      formatted_address: 'string',
      city: 'string',
      country: 'string',
      postal_code: 'string',
    },
  })
  @IsObject()
  @IsOptional()
  readonly location: object;

  @ApiProperty({
    description: 'Password',
    example: 'password',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  readonly password: string;

  // @ApiProperty({
  //   description: 'Status',
  //   example: 'ACTIVE',
  // })
  // @IsString()
  // @IsNotEmpty()
  // readonly status: string;
}
