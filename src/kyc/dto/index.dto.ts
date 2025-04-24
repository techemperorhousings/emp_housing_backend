import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { KycDocumentType, KycStatus } from '@prisma/client';
import { PaginationQueryDto } from '@utils/pagination';

export class CreateKycDto {
  @ApiProperty({ example: 'PASSPORT', enum: KycDocumentType })
  @IsEnum(KycDocumentType)
  @IsNotEmpty()
  documentType: KycDocumentType;

  @ApiProperty({ example: 'https://example.com/doc.pdf' })
  @IsNotEmpty()
  @IsUrl()
  documentUrl: string;
}

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
