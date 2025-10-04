import { ApiPropertyOptional } from '@nestjs/swagger';
import { InquiryStatus } from '@prisma/client';
import { PaginationQueryDto } from '@utils/pagination';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class QueryContactInquiryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: InquiryStatus,
    description: 'Filter inquiries by status',
    example: InquiryStatus.NEW,
  })
  @IsEnum(InquiryStatus, { message: 'Invalid status filter' })
  @IsOptional()
  status?: InquiryStatus;

  @ApiPropertyOptional({
    description: 'Filter inquiries by email address',
    example: 'user@example.com',
  })
  @IsString()
  @IsOptional()
  email?: string;
}
