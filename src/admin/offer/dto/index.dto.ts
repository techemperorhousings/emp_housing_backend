import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OfferStatus } from '@prisma/client';
import { PaginationQueryDto } from '@utils/pagination.dto';
import { IsOptional, IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export class FilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: OfferStatus,
    description: 'Filter by offer status',
  })
  @IsOptional()
  @IsEnum(OfferStatus)
  status: OfferStatus;
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
