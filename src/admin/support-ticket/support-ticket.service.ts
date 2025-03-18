import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { FilterDto } from './dto/index.dto';
import { TicketPriority } from '@prisma/client';

@Injectable()
export class SupportTicketService {
  constructor(private readonly prisma: PrismaService) {}

  //get all tickets with status filtering
  async getAllTickets(data: FilterDto) {
    const { skip, take, status } = data;

    const tickets = await this.prisma.supportTicket.findMany({
      skip,
      take,
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
    });
    return {
      message: 'Tickets fetched successfully',
      data: tickets,
    };
  }

  async getOneTicket(ticketId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return {
      message: 'Ticket fetched successfully',
      data: ticket,
    };
  }

  async assignTicket(ticketId: string, assignedToId: string) {
    await this.getOneTicket(ticketId);
    const ticket = await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { assignedToId },
    });

    return {
      message: 'Ticket assigned successfully',
      data: ticket,
    };
  }

  //change priority
  async changePriority(ticketId: string, priority: TicketPriority) {
    await this.getOneTicket(ticketId);
    const ticket = await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { priority },
    });

    return {
      message: 'Ticket priority updated successfully',
      data: ticket,
    };
  }
}
