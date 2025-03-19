import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TourStatus } from '@prisma/client';
import { PaginationQueryDto } from '@utils/pagination.dto';
import {
  IsOptional,
  IsEnum,
  IsString,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';

export class FilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: TourStatus,
    description: 'Filter by tour status',
  })
  @IsOptional()
  @IsEnum(TourStatus)
  status: TourStatus;
}

export class AssignAgentDto {
  @ApiProperty({
    description: 'Agent ID',
    type: 'string',
    required: true,
    example: 'ba9f1581-a991-49a6-ad75-0edea1da523e',
  })
  @IsNotEmpty()
  @IsString()
  agentId: string;
}

export class UpdateTourStatusDto {
  @ApiProperty({
    example: 'TOUR_ID_123',
    description: 'Tour ID for the status update',
  })
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @ApiProperty({
    enum: TourStatus,
    example: TourStatus.COMPLETED,
    description: 'Tour status',
  })
  @IsNotEmpty()
  @IsEnum(TourStatus)
  status: TourStatus;
}
