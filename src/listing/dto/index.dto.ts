import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ListingStatus, ListingType } from '@prisma/client';
import {
  IsUUID,
  IsNumber,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateListingDto {
  @ApiProperty({
    description: 'Property ID to be listed',
    example: 'c56789abcde1234567890abcdef1234567',
  })
  @IsUUID()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty({
    description: 'User ID of the person listing the property',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  listedById: string;

  @ApiProperty({ description: 'Listing price', example: 22000 })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    description: 'Type of the listing',
    enum: ListingType,
  })
  @IsEnum(ListingType)
  @IsNotEmpty()
  listingType: ListingType;
}

export class UpdateListingDto {
  @ApiProperty({ description: 'Updated listing price', required: false })
  @IsNumber()
  @IsOptional()
  price?: number;
}

export class ListingFilterDto {
  @ApiPropertyOptional({ description: 'Filter by property ID' })
  @IsUUID()
  @IsOptional()
  propertyId?: string;

  @ApiPropertyOptional({
    enum: ListingStatus,
    description: 'Filter by listing status',
  })
  @IsEnum(ListingStatus)
  @IsOptional()
  status?: ListingStatus;

  @ApiPropertyOptional({
    enum: ListingType,
    description: 'Filter by listing type',
  })
  @IsEnum(ListingType)
  @IsOptional()
  listingType?: ListingType;

  @ApiPropertyOptional({ description: 'Minimum price filter' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price filter' })
  @IsNumber()
  @Max(1000000000) // Example limit
  @IsOptional()
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Search by location' })
  @IsString()
  @IsOptional()
  location?: string;
}

export class UpdateListingStatusDto {
  @ApiProperty({
    enum: ListingStatus,
    description: 'New status for the listing',
  })
  @IsEnum(ListingStatus)
  @IsNotEmpty()
  status: ListingStatus;

  @ApiProperty({
    description: 'ID of the listing to update status',
    example: '9ba12401-b309-4405-abf4-0c00141f8f26',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
