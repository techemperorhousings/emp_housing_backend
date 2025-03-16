import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUrl, IsUUID } from 'class-validator';
import { KycDocumentType, KycStatus } from '@prisma/client';

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

export class ApproveKycDto {
  @ApiProperty({
    description: 'KYC ID to approve',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  kycId: string;

  @ApiProperty({
    description: 'KYC status',
    example: 'APPROVED',
    enum: KycStatus,
  })
  @IsEnum(KycStatus)
  status: KycStatus;
}

export class RejectKycDto {
  @ApiProperty({
    description: 'KYC ID to reject',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  kycId: string;

  @ApiProperty({
    description: 'KYC status',
    example: 'REJECTED',
    enum: KycStatus,
  })
  @IsEnum(KycStatus)
  status: KycStatus;

  @ApiProperty({
    description: 'Reason for rejection',
    example: 'Document is blurry and unreadable',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
