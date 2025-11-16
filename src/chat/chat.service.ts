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

  async sendMessage(data: SendMessageDto): Promise<Chat[]> {
    const { senderId, message } = data;

    // Fetch admin role and check sender in parallel
    const [adminRole, sender] = await Promise.all([
      this.prisma.role.findUnique({
        where: { name: 'ADMIN' },
      }),
      this.prisma.user.findUnique({
        where: { id: senderId },
        include: { role: true },
      }),
    ]);

    if (!adminRole) {
      throw new NotFoundException('Admin role not found');
    }

    if (!sender) {
      throw new NotFoundException('Sender not found');
    }

    const isAdmin = sender.role.name === 'ADMIN';
    let receiverIds: string[];

    if (isAdmin) {
      // For admin, use the provided receiverId
      if (!data.receiverId) {
        throw new BadRequestException(
          'Receiver ID is required when admin sends a message',
        );
      }
      receiverIds = [data.receiverId];
    } else {
      // For regular users, send to all admins
      const admins = await this.prisma.user.findMany({
        where: { roleId: adminRole.id },
        select: { id: true },
      });

      if (admins.length === 0) {
        throw new NotFoundException('No admin users found');
      }

      receiverIds = admins.map((admin) => admin.id);
    }

    // Use transaction
    const results = await this.prisma.$transaction(async (tx) => {
      const messages: Chat[] = [];
      const conversations = [];

      // Create messages for all receivers
      for (const receiverId of receiverIds) {
        // Determine unique pair for conversation
        const [userAId, userBId] = [senderId, receiverId].sort();

        // Create the message
        const msg = await tx.chat.create({
          data: {
            senderId,
            receiverId,
            message,
          },
        });

        // Upsert the conversation
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

        messages.push(msg);
        conversations.push(conv);
      }

      return { messages, conversations };
    });

    // Emit Pusher events after transaction
    const pusherEvents = [];

    for (let i = 0; i < results.messages.length; i++) {
      const msg = results.messages[i];
      const conv = results.conversations[i];
      const receiverId = receiverIds[i];

      // Events for receiver
      pusherEvents.push(
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
      );

      // Event for sender (only once if multiple receivers)
      if (i === 0) {
        pusherEvents.push(
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
        );
      }
    }

    await Promise.all(pusherEvents);

    return results.messages;
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
