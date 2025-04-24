import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TicketStatus, TicketPriority } from '@prisma/client';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '@utils/pagination';

export class CreateSupportTicketDto {
  @ApiProperty({
    example: 'Cannot login',
    description: 'The subject of the support ticket',
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    example: 'I am unable to login to my account.',
    description: 'Detailed description of the issue',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    example: 'Technical Issue',
    description: 'Category of the ticket',
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({
    example: 'HIGH',
    enum: TicketPriority,
    description: 'Priority level of the ticket',
  })
  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @ApiPropertyOptional({
    example: 'property_12345',
    description: 'Optional property ID related to the ticket',
  })
  @IsOptional()
  @IsString()
  propertyId?: string;

  @ApiPropertyOptional({
    example: 'listing_67890',
    description: 'Optional listing ID related to the ticket',
  })
  @IsOptional()
  @IsString()
  listingId?: string;
}

export class UpdateSupportTicketStatusDto {
  @ApiPropertyOptional({
    example: 'IN_PROGRESS',
    enum: TicketStatus,
    description: 'Update the status of the ticket',
  })
  @IsEnum(TicketStatus)
  @IsNotEmpty()
  status: TicketStatus;
}

export class UpdateSupportTicketDto {
  @ApiPropertyOptional({
    example: 'URGENT',
    enum: TicketPriority,
    description: 'Update the priority of the ticket',
  })
  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @ApiPropertyOptional({
    example: 'user_98765',
    description: 'Assign the ticket to a specific staff member',
  })
  @IsOptional()
  @IsString()
  assignedToId?: string;
}

export class CreateTicketMessageDto {
  @ApiProperty({
    example: 'Can you provide more details?',
    description: 'Message content',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}

class TicketAttachmentDto {
  @ApiProperty({
    example: 'screenshot.png',
    description: 'Filename of the attachment',
  })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({
    example: 'https://s3.amazonaws.com/bucket/file.png',
    description: 'URL of the uploaded file',
  })
  @IsString()
  @IsNotEmpty()
  fileUrl: string;
}

export class CreateTicketAttachmentsDto {
  @ApiProperty({
    description: 'List of file attachments',
    type: [TicketAttachmentDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketAttachmentDto)
  attachments: TicketAttachmentDto[];
}

export class UpdateStatusDto {
  @ApiProperty({
    example: 'IN_PROGRESS',
    enum: TicketStatus,
    description: 'Update the status of the ticket',
  })
  @IsEnum(TicketStatus)
  @IsNotEmpty()
  status: TicketStatus;

  @ApiProperty({
    example: 'ticket_98765',
    description: 'ticket Id',
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}

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
