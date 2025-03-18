import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { SupportTicketService } from './support-ticket.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import {
  CreateSupportTicketDto,
  CreateTicketMessageDto,
  CreateTicketAttachmentsDto,
  UpdateStatusDto,
} from './dto/index.dto';

@ApiTags('Support Tickets')
@ApiBearerAuth('JWT-auth')
@Controller('support-ticket')
export class SupportTicketController {
  constructor(private readonly service: SupportTicketService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new support ticket' })
  async createTicket(@Req() req, @Body() dto: CreateSupportTicketDto) {
    return this.service.createTicket(req.user.id, dto);
  }

  @Get('/user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all tickets for a user' })
  async getUserTickets(@Req() req) {
    return this.service.getUserTickets(req.user.id);
  }

  @Get('/assigned/user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all assigned tickets for a user' })
  async getAssignedTickets(@Req() req) {
    return this.service.getAssignedTickets(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket details' })
  @HttpCode(HttpStatus.OK)
  async getTicketById(@Param('id') ticketId: string) {
    return this.service.getTicketById(ticketId);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Add a message to a ticket' })
  @HttpCode(HttpStatus.OK)
  async addMessage(
    @Req() req,
    @Param('id') ticketId: string,
    @Body() dto: CreateTicketMessageDto,
  ) {
    return this.service.addMessage(ticketId, req.user.id, dto);
  }

  @Patch(':id/attachments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Upload multiple attachments for a ticket' })
  async addAttachments(
    @Req() req,
    @Param('id') ticketId: string,
    @Body() dto: CreateTicketAttachmentsDto,
  ) {
    return this.service.addAttachments(ticketId, req.user.id, dto);
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
    return this.service.replyToTicket(ticketId, staffId, message);
  }

  @Patch(':id/status/:status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update support ticket status' })
  async updateStatus(@Param() param: UpdateStatusDto) {
    const { status, id } = param;
    return this.service.updateTicketStatus(id, status);
  }
}
