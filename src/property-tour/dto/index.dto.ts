import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { TourStatus, TourType } from '@prisma/client';

export class CreatePropertyTourDto {
  @ApiProperty({
    example: 'PROPERTY_ID_123',
    description: 'Property ID for the tour',
  })
  @IsNotEmpty()
  @IsUUID()
  propertyId: string;

  @ApiProperty({
    example: 'LISTING_ID_123',
    description: 'Listing ID related to the tour',
  })
  @IsNotEmpty()
  @IsUUID()
  listingId: string;

  @ApiProperty({
    example: 'USER_ID_123',
    description: 'User who requested the tour',
  })
  @IsNotEmpty()
  @IsUUID()
  requestedById: string;

  @ApiProperty({
    example: '2025-05-01',
    description: 'Scheduled date and time',
  })
  @IsNotEmpty()
  @IsString()
  scheduledDate: string;

  @ApiProperty({
    example: '10:00',
    description: 'Scheduled time',
  })
  @IsNotEmpty()
  @IsString()
  scheduledTime: string;

  @ApiProperty({
    enum: TourType,
    example: TourType.VIRTUAL,
    description: 'Type of tour',
  })
  @IsNotEmpty()
  @IsEnum(TourType)
  tourType: TourType;

  @ApiProperty({
    example: 'https://zoom.us/meeting/123',
    description: 'Meeting link for virtual tours',
    required: false,
  })
  @IsOptional()
  @IsString()
  meetingLink?: string;

  @ApiProperty({
    example: '1234',
    description: 'Meeting password for virtual tours',
    required: false,
  })
  @IsOptional()
  @IsString()
  meetingPassword?: string;

  @ApiProperty({
    example: '123 Main St, City',
    description: 'Location for in-person tours',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    example: 'Looking forward to the tour',
    description: 'Additional notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateTourStatusDto {
  @ApiProperty({
    example: 'TOUR_ID_123',
    description: 'Tour ID for the status update',
  })
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @ApiProperty({
    enum: TourStatus,
    example: TourStatus.COMPLETED,
    description: 'Tour status',
  })
  @IsNotEmpty()
  @IsEnum(TourStatus)
  status: TourStatus;
}

export class AddFeedbackDto {
  @ApiProperty({
    example: 'Tour was great!',
    description: 'Feedback for the tour',
  })
  @IsNotEmpty()
  @IsString()
  feedback: string;
}
