import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsEmail,
  IsOptional,
} from 'class-validator';

export class CreateContactInquiryDto {
  @ApiProperty({
    description: 'Name of the person making the inquiry',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @ApiProperty({
    description: 'Email address of the person making the inquiry',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    description: 'Subject of the inquiry',
    example: 'Request for property details',
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'Subject must not exceed 200 characters' })
  subject?: string;

  @ApiProperty({
    description: 'Detailed message of the inquiry',
    example:
      'I would like to know more about the property listed on your website.',
    minLength: 10,
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Message must be at least 10 characters long' })
  @MaxLength(2000, { message: 'Message must not exceed 2000 characters' })
  note: string;
}
