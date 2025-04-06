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
} from './dto/index.dto';
import { TicketStatus } from '@prisma/client';
import { GET_ROLE_AND_PERMISSIONS } from '@utils';

@Injectable()
export class SupportTicketService {
  constructor(private readonly prisma: PrismaService) {}

  async createTicket(userId: string, dto: CreateSupportTicketDto) {
    //check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.supportTicket.create({
      data: { ...dto, userId },
    });
    return {
      message: 'Support ticket submitted successfully',
    };
  }

  async getAllTickets() {
    const tickets = await this.prisma.supportTicket.findMany({
      include: { user: true, assignedTo: true },
    });
    return {
      message: 'Tickets fetched successfully',
      data: tickets,
    };
  }

  async getUserTickets(userId: string) {
    const tickets = await this.prisma.supportTicket.findMany({
      where: { userId },
      include: { assignedTo: true },
    });
    return {
      message: 'Tickets fetched successfully',
      data: tickets,
    };
  }

  async getTicketById(ticketId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: { messages: true, attachments: true },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return {
      message: 'Ticket fetched successfully',
      data: ticket,
    };
  }

  async updateTicket(ticketId: string, dto: UpdateSupportTicketDto) {
    const ticket = await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: dto,
    });
    return {
      message: 'Ticket updated successfully',
      data: ticket,
    };
  }

  async addMessage(
    ticketId: string,
    userId: string,
    dto: CreateTicketMessageDto,
  ) {
    const message = await this.prisma.ticketMessage.create({
      data: {
        ...dto,
        ticketId,
        userId,
      },
    });
    return {
      message: 'Message added successfully',
      data: message,
    };
  }

  async addAttachments(
    ticketId: string,
    userId: string,
    dto: CreateTicketAttachmentsDto,
  ) {
    const ticket = await this.prisma.ticketAttachment.createMany({
      data: dto.attachments.map((attachment) => ({
        ticketId,
        userId,
        filename: attachment.filename,
        fileUrl: attachment.fileUrl,
      })),
    });

    return {
      message: 'Attachment added successfully',
      data: ticket,
    };
  }

  //get assigned tickets
  async getAssignedTickets(userId) {
    const tickets = await this.prisma.supportTicket.findMany({
      where: { assignedToId: userId },
    });
    return {
      message: 'Assigned tickets fetched successfully',
      data: tickets,
    };
  }

  //update ticket status
  async updateTicketStatus(ticketId: string, status: TicketStatus) {
    await this.getTicketById(ticketId);

    const updatedTicket = await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status },
    });

    return {
      message: 'Ticket status updated successfully',
      data: updatedTicket,
    };
  }

  //reply to ticket
  async replyToTicket(ticketId: string, staffId: string, message: string) {
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
      include: {
        ...GET_ROLE_AND_PERMISSIONS,
      },
    });

    // if (!staff || staff.role.name !== UserRole.SUPPORT_STAFF) {
    //   throw new ForbiddenException('Only staff members can reply to tickets');
    // }

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

    return {
      message: 'Reply sent successfully',
      ticketMessage: new_message,
    };
  }
}
