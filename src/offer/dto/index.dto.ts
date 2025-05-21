import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { OfferStatus } from '@prisma/client';
import { PaginationQueryDto } from '@utils/pagination';

export class CreateOfferDto {
  @ApiProperty({ example: 500000, description: 'Offer amount in currency' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    example: 'Looking forward to your response.',
    description: 'Message from the buyer',
    required: false,
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({
    example: 'BUYER_ID_123',
    description: 'ID of the buyer making the offer',
  })
  @IsNotEmpty()
  @IsUUID()
  buyerId: string;

  @ApiProperty({
    example: 'PROPERTY_ID_123',
    description: 'ID of the property the offer is made on',
  })
  @IsNotEmpty()
  @IsUUID()
  propertyId: string;
}

export class UpdateOfferStatusDto {
  @ApiProperty({
    example: 'OFFER_ID_123',
    description: 'Offer ID for the status update',
  })
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @ApiProperty({
    enum: OfferStatus,
    description: 'New status for the offer',
    example: 'PENDING',
  })
  @IsEnum(OfferStatus)
  @IsNotEmpty()
  status: OfferStatus;
}

export class FilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: OfferStatus,
    description: 'Filter by offer status',
  })
  @IsOptional()
  @IsEnum(OfferStatus)
  status: OfferStatus;
}
