import { Injectable, NotFoundException } from '@nestjs/common';
import { Chat } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { SendMessageDto } from './dto';
import { PusherService } from './pusher.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private pusherService: PusherService,
  ) {}

  async sendMessage(data: SendMessageDto): Promise<Chat> {
    const { senderId, message } = data;

    // Step 1: Fetch the admin role
    const adminRole = await this.prisma.role.findUnique({
      where: { name: 'ADMIN' },
    });

    if (!adminRole) {
      throw new NotFoundException('Admin role not found');
    }

    // Step 2: Fetch an admin user
    const admin = await this.prisma.user.findFirst({
      where: { roleId: adminRole.id },
    });

    if (!admin) {
      throw new NotFoundException('No admin user found');
    }

    const msg = await this.prisma.chat.create({
      data: {
        senderId,
        receiverId: admin.id,
        message,
      },
    });

    await this.pusherService.trigger(
      `chat-${admin.id}`,
      'new-message',
      message,
    );

    return msg;
  }

  async getUserChats(currentUserId: string): Promise<any> {
    const sentTo = await this.prisma.chat.findMany({
      where: { senderId: currentUserId },
      select: {
        receiver: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            isActive: true,
            phoneNumber: true,
            profileImage: true,
          },
        },
      },
      distinct: ['receiverId'],
    });

    const receivedFrom = await this.prisma.chat.findMany({
      where: { receiverId: currentUserId },
      select: {
        sender: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            isActive: true,
            phoneNumber: true,
            profileImage: true,
          },
        },
      },
      distinct: ['senderId'],
    });

    // Merge unique users
    const users = [
      ...sentTo.map((c) => c.receiver),
      ...receivedFrom.map((c) => c.sender),
    ];

    // Remove nulls and duplicates
    const uniqueUsers = users
      .filter(Boolean)
      .filter(
        (user, index, self) =>
          index === self.findIndex((u) => u.id === user.id),
      );

    return uniqueUsers;
  }
  async getMesagesSenderReceiver(
    senderId: string,
    receiverId: string,
  ): Promise<Chat[]> {
    return this.prisma.chat.findMany({
      where: {
        OR: [
          { senderId: senderId, receiverId: receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
  }

  async getUnreadCountsForUser(userId: string) {
    const unreadCounts = await this.prisma.chat.groupBy({
      by: ['senderId'],
      where: {
        receiverId: userId,
        isRead: false,
      },
      _count: {
        id: true,
      },
    });

    if (unreadCounts.length < 1) {
      return {
        userId,
        unreadCount: 0,
      };
    }

    return unreadCounts.map((entry) => ({
      senderId: entry.senderId,
      unreadCount: entry._count.id,
    }));
  }

  async markMessagesAsRead(senderId: string, receiverId: string) {
    return this.prisma.chat.updateMany({
      where: {
        senderId,
        receiverId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  async getAllChats(): Promise<Chat[]> {
    return this.prisma.chat.findMany();
  }
}
