import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PusherService } from '@pusher/pusher.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private pusherService: PusherService,
  ) {}

  async sendMessage(senderId: string, receiverId: string, content: string) {
    // Verify both users exist
    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }

    const message = await this.prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    // Trigger Pusher events for both users
    await this.pusherService.trigger(
      `private-user-${senderId}`,
      'new-message',
      message,
    );

    await this.pusherService.trigger(
      `private-user-${receiverId}`,
      'new-message',
      message,
    );

    return message;
  }

  async getConversation(userId: string, otherUserId: string) {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: userId,
            receiverId: otherUserId,
          },
          {
            senderId: otherUserId,
            receiverId: userId,
          },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return messages;
  }

  // Get all conversations for a user, along with the latest message in each conversation, sorted by recency
  async getConversations(userId: string) {
    // Get all users this user has exchanged messages with
    const sentMessages = await this.prisma.message.findMany({
      where: {
        senderId: userId,
      },
      select: {
        receiverId: true,
      },
      distinct: ['receiverId'],
    });

    const receivedMessages = await this.prisma.message.findMany({
      where: {
        receiverId: userId,
      },
      select: {
        senderId: true,
      },
      distinct: ['senderId'],
    });

    // Combine unique user IDs
    const contactIds = new Set([
      ...sentMessages.map((msg) => msg.receiverId),
      ...receivedMessages.map((msg) => msg.senderId),
    ]);

    // Fetch user details and latest message for each conversation
    const conversations = await Promise.all(
      Array.from(contactIds).map(async (contactId) => {
        const latestMessage = await this.prisma.message.findFirst({
          where: {
            OR: [
              {
                senderId: userId,
                receiverId: contactId,
              },
              {
                senderId: contactId,
                receiverId: userId,
              },
            ],
          },
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            sender: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        });

        const contact = await this.prisma.user.findUnique({
          where: { id: contactId },
          select: {
            id: true,
            email: true,
          },
        });

        return {
          contact,
          latestMessage,
        };
      }),
    );

    // Sort by latest message
    conversations.sort((a, b) => {
      return (
        new Date(b.latestMessage.createdAt).getTime() -
        new Date(a.latestMessage.createdAt).getTime()
      );
    });

    return conversations;
  }

  //mark messages as read
  async markMessagesAsRead(senderId: string, receiverId: string) {
    const messages = await this.prisma.message.updateMany({
      where: {
        senderId,
        receiverId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
    return messages;
  }

  //delete a message
  async deleteMessage(messageId: string) {
    const message = await this.prisma.message.delete({
      where: {
        id: messageId,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return message;
  }
}
