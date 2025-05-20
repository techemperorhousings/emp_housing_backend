import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  IsUUID,
  IsArray,
} from 'class-validator';
import { ListingType, PropertyStatus, PropertyType } from '@prisma/client';
import { PaginationQueryDto } from '@utils/pagination';
import { Transform } from 'class-transformer';

export class CreatePropertyDto {
  @ApiProperty({
    example: 'Luxury Villa',
    description: 'Name of the property',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'A beautiful 5-bedroom villa with a sea view.',
    description: 'Description of the property',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 500000, description: 'Price of the property' })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({
    example: 100000,
    description: 'Minimun Price of the property',
  })
  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @ApiProperty({
    example: 'Lekki Conservation Centre, Lagos',
    description: 'Address of the property',
  })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({
    example: PropertyType.HOUSE,
    enum: PropertyType,
    description: 'Type of property',
  })
  @IsNotEmpty()
  @IsEnum(PropertyType)
  type: PropertyType;

  @ApiProperty({
    example: 4,
    description: 'Number of bedrooms in the property',
  })
  @IsNotEmpty()
  @IsNumber()
  bedrooms: number;

  @ApiProperty({
    example: 3,
    description: 'Number of bathrooms in the property',
  })
  @IsNotEmpty()
  @IsNumber()
  bathrooms: number;

  @ApiProperty({
    example: 3,
    description: 'Number of toilets in the property',
  })
  @IsNotEmpty()
  @IsNumber()
  toilets: number;

  @ApiProperty({
    example: 3,
    description: 'Number of cars that can fit',
  })
  @IsNotEmpty()
  @IsNumber()
  parkingSpace: number;

  @ApiProperty({
    example: '2500 sq meters',
    description: 'Total size of the property in square feet',
  })
  @IsNotEmpty()
  @IsString()
  size: string;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    example: ['4 bedrooms', '2 bathrooms', 'Swimming pool', 'Garden'],
    description: 'List of features of the property',
    type: [String],
  })
  features: string[];

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
      'https://example.com/image3.jpg',
    ],
    description: 'List of image URLs for the property',
    type: [String],
  })
  images: string[];

  @IsString()
  @ApiProperty({
    example: 'https://example.com/documents/property-ownership.pdf',
    description: 'URL of the uploaded property document',
  })
  propertyDocument: string;
}

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {}

export class SearchQueryDto {
  @ApiPropertyOptional({
    example: 'Los Angeles',
    description: 'Filter properties by location',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    example: PropertyType.APARTMENT,
    enum: PropertyType,
    description: 'Filter by property type',
  })
  @IsOptional()
  @IsEnum(PropertyType)
  type?: PropertyType;

  @ApiPropertyOptional({
    example: PropertyStatus.SOLD,
    enum: PropertyStatus,
    description: 'Filter by property status',
  })
  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;
}

export class PropertyFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: 500000,
    description: 'Filter properties by minimum price',
  })
  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({
    example: 1000000,
    description: 'Filter properties by maximum price',
  })
  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({
    example: PropertyStatus.SOLD,
    enum: PropertyStatus,
    description: 'Filter by property status',
  })
  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @ApiPropertyOptional({
    example: ListingType.FOR_RENT,
    enum: ListingType,
    description: 'Filter by listing type',
  })
  @IsOptional()
  @IsEnum(ListingType)
  listingType?: ListingType;

  @ApiPropertyOptional({
    example: 'Los Angeles',
    description: 'Filter properties by location',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    example: PropertyType.APARTMENT,
    enum: PropertyType,
    description: 'Filter by property type',
  })
  @IsOptional()
  @IsEnum(PropertyType)
  type?: PropertyType;
}

export class PropertyStatusDto {
  @ApiProperty({
    enum: PropertyStatus,
    description: 'Current status of the property',
  })
  @IsNotEmpty()
  @IsEnum(PropertyStatus)
  status: PropertyStatus;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique identifier of the property',
  })
  @IsNotEmpty()
  @IsUUID()
  id: string;
}

export class DeletePropertyDto {
  @ApiProperty({
    example: 'the property is fake',
    description: 'Reason for deleting the property',
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  reason: string;
}

export class ReportPropertyDto {
  @ApiProperty({
    example: 'the property is fake',
    description: 'Reason for reporting the property',
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  reason: string;
}
