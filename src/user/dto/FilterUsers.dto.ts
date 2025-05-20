import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '@utils/pagination';
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class FilterUsersDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by name or email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsString()
  isActive?: string;

  @ApiPropertyOptional({ description: 'Filter by email verification status' })
  @IsOptional()
  @IsString()
  verified?: string;

  @ApiPropertyOptional({ description: 'Filter by kyc verification status' })
  @IsOptional()
  @IsString()
  kycVerified?: string;

  @ApiPropertyOptional({ description: 'Filter by role name (e.g., admin)' })
  @IsOptional()
  @Type(() => Boolean)
  @IsString()
  role?: string;
}
