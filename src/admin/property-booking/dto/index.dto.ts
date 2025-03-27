import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '@prisma/client';
import { PaginationQueryDto } from '@utils/pagination.dto';
import { IsOptional, IsEnum, IsString, IsNotEmpty } from 'class-validator';

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
