import { ApiProperty } from '@nestjs/swagger';
import { RentalStatus } from '@prisma/client';
import { IsNotEmpty, IsEnum, IsUUID } from 'class-validator';

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
