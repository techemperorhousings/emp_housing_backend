import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RentalStatus } from '@prisma/client';
import {
  IsNotEmpty,
  IsEnum,
  IsUUID,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRentalAgreementDto {
  @ApiProperty({
    description: 'ID of the property being rented',
    example: '9ba12401-b309-4405-abf4-0c00141f8f26',
  })
  @IsUUID()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty({
    description: 'ID of the property booking by user',
    example: '9ba12401-b309-4405-abf4-0c00141f8f26',
  })
  @IsUUID()
  @IsNotEmpty()
  bookingId: string;

  @ApiProperty({
    description: 'Tenant user ID',
    example: '84a9ae9a-3711-4114-86fe-2f4cdff2f03f',
  })
  @IsUUID()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty({ description: 'Rent amount', example: 1500.0 })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ description: 'Deposit amount', example: 1000.0 })
  @IsNumber()
  @IsNotEmpty()
  depositAmount: number;

  @ApiProperty({ description: 'Lease start date', example: '2025-04-01' })
  @IsString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ description: 'Lease end date', example: '2026-04-01' })
  @IsString()
  @IsNotEmpty()
  endDate: string;
}

export class UpdateRentalAgreementDto {
  @ApiPropertyOptional({ description: 'New rent amount' })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiProperty({ description: 'New deposit amount' })
  @IsNumber()
  @IsOptional()
  depositAmount?: number;

  @ApiProperty({ description: 'New lease start date' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: 'New lease end date' })
  @IsString()
  @IsOptional()
  endDate?: Date;
}

export class UpdateRentalStatusDto {
  @ApiProperty({ description: 'New rental status', enum: RentalStatus })
  @IsNotEmpty()
  @IsEnum(RentalStatus)
  status: RentalStatus;

  @ApiProperty({ description: 'ID of the rental agreement to update status' })
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
