import { ApiProperty } from '@nestjs/swagger';
import { KycStatus } from '@prisma/client';
import { PaginationQueryDto } from '@utils/pagination.dto';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GetKycQueryDto extends PaginationQueryDto {
  @ApiProperty({
    description: 'Filter KYC submissions by status',
    enum: KycStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(KycStatus)
  status?: KycStatus;
}

export class RejectKycDto {
  @ApiProperty({
    description: 'Reason for rejection',
    example: 'Documents are expired or illegible',
  })
  @IsNotEmpty()
  @IsString()
  reason: string;
}
