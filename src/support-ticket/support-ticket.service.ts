import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import {
  CreateSupportTicketDto,
  UpdateSupportTicketDto,
  CreateTicketMessageDto,
  CreateTicketAttachmentsDto,
  FilterDto,
} from './dto/index.dto';
import {
  SupportTicket,
  TicketAttachment,
  TicketMessage,
  TicketPriority,
  TicketStatus,
} from '@prisma/client';
import { PaginatedResponse } from '@utils/pagination';

@Injectable()
export class SupportTicketService {
  constructor(private readonly prisma: PrismaService) {}

  async createTicket(userId: string, dto: CreateSupportTicketDto) {
    return await this.prisma.supportTicket.create({
      data: { ...dto, userId },
    });
  }

  //get all tickets with status filtering
  async getAllTickets(
    data: FilterDto,
  ): Promise<PaginatedResponse<SupportTicket>> {
    const { skip, take, status } = data;

    const [tickets, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        skip,
        take,
        where: status ? { status } : {},
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.supportTicket.count(),
    ]);
    return {
      data: tickets,
      total,
      skip,
      take,
    };
  }

  async getUserTickets(userId: string): Promise<SupportTicket[]> {
    return await this.prisma.supportTicket.findMany({
      where: { userId },
      include: { assignedTo: true },
    });
  }

  async getTicketById(ticketId: string): Promise<SupportTicket> {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: { messages: true, attachments: true },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async updateTicket(
    ticketId: string,
    dto: UpdateSupportTicketDto,
  ): Promise<SupportTicket> {
    return await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: dto,
    });
  }

  async addMessage(
    ticketId: string,
    userId: string,
    dto: CreateTicketMessageDto,
  ): Promise<TicketMessage> {
    return await this.prisma.ticketMessage.create({
      data: {
        ...dto,
        ticketId,
        userId,
      },
    });
  }

  async addAttachments(
    ticketId: string,
    userId: string,
    dto: CreateTicketAttachmentsDto,
  ): Promise<TicketAttachment[]> {
    await this.prisma.ticketAttachment.createMany({
      data: dto.attachments.map((attachment) => ({
        ticketId,
        userId,
        filename: attachment.filename,
        fileUrl: attachment.fileUrl,
      })),
    });
    return await this.prisma.ticketAttachment.findMany({
      where: { ticketId },
    });
  }

  //get assigned tickets
  async getAssignedTickets(userId): Promise<SupportTicket[]> {
    return await this.prisma.supportTicket.findMany({
      where: { assignedToId: userId },
    });
  }

  //update ticket status
  async updateTicketStatus(
    ticketId: string,
    status: TicketStatus,
  ): Promise<SupportTicket> {
    await this.getTicketById(ticketId);

    return await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status },
    });
  }

  //reply to ticket
  async replyToTicket(
    ticketId: string,
    staffId: string,
    message: string,
  ): Promise<TicketMessage> {
    // Check if the ticket exists
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    // Ensure the user is staff
    const staff = await this.prisma.user.findUnique({
      where: { id: staffId },
      include: { role: true },
    });

    if (!staff || staff.role.name !== 'SUPPORT_STAFF') {
      throw new ForbiddenException('Only staff members can reply to tickets');
    }

    // Create a staff reply message
    const new_message = await this.prisma.ticketMessage.create({
      data: {
        ticketId,
        userId: staffId,
        message,
        isStaffReply: true, // Mark reply as from staff
      },
    });

    // Update ticket status to "IN_PROGRESS" if it's still OPEN
    if (ticket.status === TicketStatus.OPEN) {
      await this.prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: TicketStatus.IN_PROGRESS },
      });
    }

    return new_message;
  }

  async getOneTicket(ticketId: string): Promise<SupportTicket> {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  async assignTicket(
    ticketId: string,
    assignedToId: string,
  ): Promise<SupportTicket> {
    await this.getOneTicket(ticketId);
    return await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { assignedToId },
    });
  }

  //change priority
  async changePriority(
    ticketId: string,
    priority: TicketPriority,
  ): Promise<SupportTicket> {
    await this.getOneTicket(ticketId);
    return await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { priority },
    });
  }
}
