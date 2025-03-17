import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ListingStatus, ListingType } from '@prisma/client';
import { PaginationQueryDto } from '@utils/pagination.dto';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

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

export class ListingFilterDto extends PaginationQueryDto {
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

export class UpdateListingDto {
  @ApiProperty({ description: 'Updated listing price', required: false })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({
    description: 'Updated type of the listing',
    enum: ListingType,
    required: false,
  })
  @IsEnum(ListingType)
  @IsOptional()
  listingType?: ListingType;
}
