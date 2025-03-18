import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SupportTicketService } from './support-ticket.service';
import { ApiOperation, ApiBearerAuth, ApiTags, ApiBody } from '@nestjs/swagger';
import { AssignTicketDto, FilterDto, TicketPriorityDto } from './dto/index.dto';
import { AdminGuard } from '@guards/admin.guard';
import { TicketPriority } from '@prisma/client';

@ApiTags('admin/tickets')
@ApiBearerAuth('JWT-auth')
@UseGuards(AdminGuard)
@Controller('admin/tickets')
export class SupportTicketController {
  constructor(private readonly service: SupportTicketService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all tickets with pagination' })
  async getAllTickets(@Query() filters: FilterDto) {
    return this.service.getAllTickets(filters);
  }

  @Patch(':id/assign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign a ticket to an agent' })
  @ApiBody({
    type: AssignTicketDto,
  })
  async assignTicket(
    @Param('id') ticketId: string,
    @Body('assignedToId') assignedToId: string,
  ) {
    return this.service.assignTicket(ticketId, assignedToId);
  }

  @Patch(':id/priority')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change priority of a ticket' })
  @ApiBody({
    type: TicketPriorityDto,
  })
  async changePriority(
    @Param('id') ticketId: string,
    @Body('priority') priority: TicketPriority,
  ) {
    return this.service.changePriority(ticketId, priority);
  }
}
