import { ApiProperty } from '@nestjs/swagger';
import { RentalStatus } from '@prisma/client';
import { IsUUID, IsDate, IsNotEmpty, IsEnum, IsNumber } from 'class-validator';

export class CreateRentalAgreementDto {
  @ApiProperty({
    description: 'ID of the listing being rented',
    example: '9ba12401-b309-4405-abf4-0c00141f8f26',
  })
  @IsUUID()
  @IsNotEmpty()
  listingId: string;

  @ApiProperty({
    description: 'Tenant user ID',
    example: '84a9ae9a-3711-4114-86fe-2f4cdff2f03f',
  })
  @IsUUID()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty({
    description: 'Landlord user ID',
    example: '2d2b3c9b-0172-4710-9ad5-42bd014a2ebd',
  })
  @IsUUID()
  @IsNotEmpty()
  landlordId: string;

  @ApiProperty({ description: 'Rent amount', example: 1500.0 })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ description: 'Deposit amount', example: 1000.0 })
  @IsNumber()
  @IsNotEmpty()
  depositAmount: number;

  @ApiProperty({ description: 'Lease start date', example: '2025-04-01' })
  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({ description: 'Lease end date', example: '2026-04-01' })
  @IsDate()
  @IsNotEmpty()
  endDate: Date;
}

export class UpdateRentalStatusDto {
  @ApiProperty({ description: 'New rental status' })
  @IsNotEmpty()
  @IsEnum(RentalStatus)
  status: RentalStatus;

  @ApiProperty({ description: 'ID of the rental agreement to update status' })
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
