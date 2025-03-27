import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  IsUUID,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyStatus, PropertyType } from '@prisma/client';
import { PaginationQueryDto } from '@utils/pagination.dto';

export class FeatureDto {
  @ApiProperty({
    example: 'Swimming Pool',
    description: 'Feature name of the property',
  })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({
    example: 1,
    description: 'Number of times this feature is available',
  })
  @IsOptional()
  @IsNumber()
  count: number;

  @ApiPropertyOptional({
    example: 'Luxury pool with heating system',
    description: 'Description of the feature',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class PropertyImageDto {
  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'URL of the property image',
  })
  @IsNotEmpty()
  @IsString()
  url: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indicates if this image is the featured image',
  })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}

export class PropertyDocumentDto {
  @ApiProperty({
    example: 'https://example.com/document.pdf',
    description: 'URL of the property document',
  })
  @IsNotEmpty()
  @IsString()
  url: string;

  @ApiProperty({
    example: 'Ownership Deed',
    description: 'Name of the document',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class CreatePropertyDto {
  @ApiProperty({
    example: 'Luxury Villa',
    description: 'Title of the property listing',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'A beautiful 5-bedroom villa with a sea view.',
    description: 'Description of the property',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 500000, description: 'Price of the property in USD' })
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @ApiProperty({
    example: 'Los Angeles, CA',
    description: 'General location of the property',
  })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({
    example: PropertyType.HOUSE,
    enum: PropertyType,
    description: 'Type of property',
  })
  @IsNotEmpty()
  @IsEnum(PropertyType)
  type: PropertyType;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Unique identifier of the property owner',
  })
  @IsNotEmpty()
  @IsUUID()
  ownerId: string;

  @ApiProperty({
    example: '123 Palm Street',
    description: 'Street address of the property',
  })
  @IsNotEmpty()
  @IsString()
  street: string;

  @ApiProperty({
    example: 'Near Central Park',
    description: 'Nearest landmark to the property',
  })
  @IsNotEmpty()
  @IsString()
  nearestLandMark: string;

  @ApiProperty({
    example: 'New York',
    description: 'City where the property is located',
  })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({
    example: 'New York',
    description: 'State where the property is located',
  })
  @IsNotEmpty()
  @IsString()
  state: string;

  @ApiProperty({ example: '10001', description: 'ZIP code of the property' })
  @IsNotEmpty()
  @IsString()
  zipCode: string;

  @ApiProperty({
    example: 'USA',
    description: 'Country where the property is located',
  })
  @IsNotEmpty()
  @IsString()
  country: string;

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
    example: 2500,
    description: 'Total area of the property in square feet',
  })
  @IsNotEmpty()
  @IsNumber()
  area: number;

  @ApiPropertyOptional({
    example: 2015,
    description: 'Year the property was built',
  })
  @IsOptional()
  @IsNumber()
  yearBuilt?: number;

  @ApiProperty({
    example: '123 Palm Street, New York, NY 10001',
    description: 'Full address of the property',
  })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiPropertyOptional({
    type: [FeatureDto],
    description: 'List of features included in the property',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeatureDto)
  features?: FeatureDto[];

  @ApiProperty({
    type: [PropertyImageDto],
    description: 'List of images of the property',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyImageDto)
  images?: PropertyImageDto[];

  @ApiProperty({
    type: [PropertyDocumentDto],
    description: 'List of documents related to the property',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyDocumentDto)
  documents?: PropertyDocumentDto[];
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
