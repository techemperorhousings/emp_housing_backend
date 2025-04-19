import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '@prisma/client';
import { PaginationQueryDto } from '@utils/pagination';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

export class BookingFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: BookingStatus,
    description: 'Filter by booking status',
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({
    description: 'Filter by property ID',
    example: 'a1234567-bcde-890f-gh12-34567890ijkl',
  })
  @IsOptional()
  @IsString()
  propertyId?: string;

  @ApiPropertyOptional({
    description: 'Filter by user ID',
    example: 'u9876543-vwxy-210z-ab34-567890mnopqr',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filter by listing ID',
    example: 'l5678901-stuv-234w-xy56-789012zabcd',
  })
  @IsOptional()
  @IsString()
  listingId?: string;
}

export class UpdateBookingStatusDto {
  @ApiProperty({
    enum: BookingStatus,
    description: 'New status for the booking',
    example: 'CONFIRMED',
  })
  @IsNotEmpty()
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @ApiPropertyOptional({
    description: 'Optional response message for the booking update',
    example: 'Your booking has been confirmed successfully!',
  })
  @IsOptional()
  @IsString()
  responseMessage?: string;
}
