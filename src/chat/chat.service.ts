import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

    // Fetch the admin role
    const adminRole = await this.prisma.role.findUnique({
      where: { name: 'ADMIN' },
    });

    if (!adminRole) {
      throw new NotFoundException('Admin role not found');
    }

    //Fetch an admin user
    const admin = await this.prisma.user.findFirst({
      where: { roleId: adminRole.id },
    });

    if (!admin) {
      throw new NotFoundException('No admin user found');
    }

    // Check if the sender is an admin
    const sender = await this.prisma.user.findUnique({
      where: { id: senderId },
      include: { role: true },
    });

    if (!sender) {
      throw new NotFoundException('Sender not found');
    }

    let receiverId: string;

    if (sender.role.name === 'ADMIN') {
      // For admin, use the provided receiverId
      if (!data.receiverId) {
        throw new BadRequestException(
          'Receiver ID is required when admin sends a message',
        );
      }
      receiverId = data.receiverId;
    } else {
      // For regular users, send to admin
      receiverId = admin.id;
    }

    //Determine unique pair for conversation
    const [userAId, userBId] = [senderId, receiverId].sort();

    // Wrap message + conversation in a transaction
    const [msg, conv] = await this.prisma.$transaction(async (tx) => {
      // create the message
      const msg = await tx.chat.create({
        data: {
          senderId,
          receiverId,
          message,
        },
      });

      // upsert the conversation
      const conv = await tx.conversation.upsert({
        where: {
          userAId_userBId: {
            userAId,
            userBId,
          },
        },
        create: {
          userAId,
          userBId,
          lastMessage: message,
          lastMessageAt: msg.createdAt,
        },
        update: {
          lastMessage: message,
          lastMessageAt: msg.createdAt,
        },
      });

      return [msg, conv];
    });

    // Emit Pusher events
    await Promise.all([
      this.pusherService.trigger(`chat-${receiverId}`, 'new-message', {
        message: msg,
        conversationId: conv.id,
      }),
      this.pusherService.trigger(
        `conversations-${receiverId}`,
        'conversation-updated',
        {
          conversationId: conv.id,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          otherUserId: senderId,
        },
      ),
      this.pusherService.trigger(
        `conversations-${senderId}`,
        'conversation-updated',
        {
          conversationId: conv.id,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          otherUserId: receiverId,
        },
      ),
    ]);

    return msg;
  }

  async getUserChats(currentUserId: string): Promise<any> {
    // find conversations where the user is userA or userB
    const convs = await this.prisma.conversation.findMany({
      where: {
        OR: [{ userAId: currentUserId }, { userBId: currentUserId }],
      },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        userA: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            isActive: true,
            phoneNumber: true,
            profileImage: true,
          },
        },
        userB: {
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
    });

    // map each conversation to the "other user" and include lastMessage / lastMessageAt
    const result = convs.map((c) => {
      const otherUser = c.userAId === currentUserId ? c.userB : c.userA;
      return {
        conversationId: c.id,
        user: otherUser,
        lastMessage: c.lastMessage,
        lastMessageAt: c.lastMessageAt,
      };
    });

    return result;
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
