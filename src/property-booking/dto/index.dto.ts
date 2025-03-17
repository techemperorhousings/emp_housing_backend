import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePropertyBookingDto {
  @ApiProperty({ example: 'PROPERTY_ID_123', description: 'Property ID' })
  @IsNotEmpty()
  @IsString()
  propertyId: string;

  @ApiProperty({ example: 'LISTING_ID_123', description: 'Listing ID' })
  @IsNotEmpty()
  @IsString()
  listingId: string;

  @ApiProperty({ example: 'USER_ID_123', description: 'User ID (Tenant)' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    example: '2025-04-01',
    description: 'Check-in Date',
  })
  @IsNotEmpty()
  @IsString()
  checkInDate: string;

  @ApiProperty({
    example: '2025-04-07',
    description: 'Check-out Date',
  })
  @IsNotEmpty()
  @IsString()
  checkoutDate: string;

  @ApiPropertyOptional({
    example: 'I would like to book this property.',
    description: 'Request message',
  })
  @IsOptional()
  @IsString()
  requestMessage?: string;
}

export class RejectBookingDto {
  @ApiProperty({
    example: 'I have other plans on that day.',
    description: 'Response message',
  })
  @IsNotEmpty()
  @IsString()
  responseMessage: string;
}

export class AcceptBookingDto {
  @ApiProperty({
    example: 'Thank you for booking with us.',
    description: 'Response message',
  })
  @IsNotEmpty()
  @IsString()
  responseMessage: string;
}
