import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { SupportTicketService } from './support-ticket.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import {
  CreateSupportTicketDto,
  CreateTicketMessageDto,
  CreateTicketAttachmentsDto,
  UpdateStatusDto,
  AssignTicketDto,
  FilterDto,
  TicketPriorityDto,
} from './dto/index.dto';
import { TicketPriority } from '@prisma/client';

@ApiTags('Support Tickets')
@ApiBearerAuth('JWT-auth')
@Controller('support-ticket')
export class SupportTicketController {
  constructor(private readonly service: SupportTicketService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new support ticket' })
  async createTicket(@Req() req, @Body() dto: CreateSupportTicketDto) {
    const ticket = await this.service.createTicket(req.user.id, dto);
    return {
      message: 'Ticket created successfully',
      ...ticket,
    };
  }

  @Get('/user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all tickets for a user' })
  async getUserTickets(@Req() req) {
    const tickets = await this.service.getUserTickets(req.user.id);
    return {
      message: 'Tickets fetched successfully',
      ...tickets,
    };
  }

  @Get('/assigned/user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all assigned tickets for a user' })
  async getAssignedTickets(@Req() req) {
    const tickets = await this.service.getAssignedTickets(req.user.id);
    return {
      message: 'Tickets fetched successfully',
      ...tickets,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all tickets with pagination' })
  async getAllTickets(@Query() filters: FilterDto) {
    const tickets = await this.service.getAllTickets(filters);
    return {
      message: 'Tickets fetched successfully',
      ...tickets,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket details' })
  @HttpCode(HttpStatus.OK)
  async getTicketById(@Param('id') ticketId: string) {
    const ticket = await this.service.getTicketById(ticketId);
    return {
      message: 'Ticket fetched successfully',
      ...ticket,
    };
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Add a message to a ticket' })
  @HttpCode(HttpStatus.OK)
  async addMessage(
    @Req() req,
    @Param('id') ticketId: string,
    @Body() dto: CreateTicketMessageDto,
  ) {
    const _message = await this.service.addMessage(ticketId, req.user.id, dto);
    return {
      message: 'Message added successfully',
      ..._message,
    };
  }

  @Patch(':id/attachments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload multiple attachments for a ticket' })
  async addAttachments(
    @Req() req,
    @Param('id') ticketId: string,
    @Body() dto: CreateTicketAttachmentsDto,
  ) {
    const attachments = await this.service.addAttachments(
      ticketId,
      req.user.id,
      dto,
    );
    return {
      message: 'Attachments added successfully',
      ...attachments,
    };
  }

  @Patch(':id/reply')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Staff reply to a ticket' })
  @ApiBody({
    type: CreateTicketMessageDto,
  })
  async replyToTicket(
    @Param('id') ticketId: string,
    @Body('message') message: string,
    @Req() req,
  ) {
    const staffId = req.user.id;
    const _message = await this.service.replyToTicket(
      ticketId,
      staffId,
      message,
    );
    return {
      message: 'Message replied successfully',
      ..._message,
    };
  }

  @Patch(':id/status/:status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update support ticket status' })
  async updateStatus(@Param() param: UpdateStatusDto) {
    const { status, id } = param;
    const ticket = await this.service.updateTicketStatus(id, status);
    return {
      message: 'Ticket status updated successfully',
      ...ticket,
    };
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
    const ticket = await this.service.assignTicket(ticketId, assignedToId);
    return {
      message: 'Ticket assigned successfully',
      ...ticket,
    };
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
    const ticket = await this.service.changePriority(ticketId, priority);
    return {
      message: 'Ticket priority updated successfully',
      ...ticket,
    };
  }
}
