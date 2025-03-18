import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketPriority, TicketStatus } from '@prisma/client';
import { PaginationQueryDto } from '@utils/pagination.dto';
import { IsOptional, IsEnum, IsString, IsNotEmpty } from 'class-validator';

export class FilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: TicketStatus,
    description: 'Filter by offer status',
  })
  @IsOptional()
  @IsEnum(TicketStatus)
  status: TicketStatus;
}

export class AssignTicketDto {
  @ApiProperty({ example: 'user_98765', description: 'User ID of the agent' })
  @IsString()
  @IsNotEmpty()
  assignedToId: string;
}

export class TicketPriorityDto {
  @ApiProperty({
    enum: TicketPriority,
  })
  @IsString()
  @IsNotEmpty()
  priority: TicketPriority;
}
