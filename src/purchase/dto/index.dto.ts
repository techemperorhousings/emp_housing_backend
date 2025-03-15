import { IsUUID, IsNumber, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PurchaseStatus } from '@prisma/client';

export class CreatePurchaseDto {
  @ApiProperty({
    description: 'The ID of the listing being purchased',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  listingId: string;

  @ApiProperty({
    description: 'The ID of the buyer making the purchase',
    example: '111e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  @IsNotEmpty()
  buyerId: string;

  @ApiProperty({
    description: 'The ID of the seller who owns the listing',
    example: '222e4567-e89b-12d3-a456-426614174002',
  })
  @IsUUID()
  @IsNotEmpty()
  sellerId: string;

  @ApiProperty({
    description: 'The purchase price agreed upon for the property',
    example: 500000,
  })
  @IsNumber()
  @IsNotEmpty()
  purchasePrice: number;

  @ApiProperty({
    description: 'The closing date for the purchase',
    example: '2022-01-01',
  })
  @IsNotEmpty()
  @IsString()
  closingDate: string;

  @ApiProperty({
    description: 'The date when the purchase was made',
    example: '2022-01-01',
  })
  @IsOptional()
  @IsString()
  purchaseDate: string;
}

export class UpdatePurchaseStatusDto {
  @ApiProperty({
    description: 'The new status for the purchase',
    example: 'PAID',
    enum: PurchaseStatus,
  })
  @IsEnum(PurchaseStatus)
  status: PurchaseStatus;

  @ApiProperty({
    description: 'The ID of the purchase to update status',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
