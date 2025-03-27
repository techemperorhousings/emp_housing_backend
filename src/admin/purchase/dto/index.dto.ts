import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PurchaseStatus } from '@prisma/client';
import { PaginationQueryDto } from '@utils/pagination.dto';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class FilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: PurchaseStatus,
    description: 'Filter by purchase status',
  })
  @IsOptional()
  @IsEnum(PurchaseStatus)
  status: PurchaseStatus;
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
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
