import { ApiPropertyOptional } from '@nestjs/swagger';
import { InquiryStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateContactInquiryDto {
  @ApiPropertyOptional({
    enum: InquiryStatus,
    description: 'Update inquiry status',
    example: InquiryStatus.RESOLVED,
  })
  @IsEnum(InquiryStatus, { message: 'Invalid status value' })
  @IsOptional()
  status?: InquiryStatus;
}
