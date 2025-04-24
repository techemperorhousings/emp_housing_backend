import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Chat } from '@prisma/client';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto';

@ApiTags('In-App-Chat')
@ApiBearerAuth('JWT-auth')
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('/message')
  async sendMessage(@Body() data: SendMessageDto): Promise<Chat> {
    const resp = await this.chatService.sendMessage(data);
    return resp;
  }

  @Get('/user/:userId')
  @ApiOperation({ summary: 'Get all chats for a user' })
  async getChatByUserId(
    @Param('userId') userId: string,
  ): Promise<Chat[] | any> {
    const resp = await this.chatService.getUserChats(userId);
    return resp;
  }

  @Get('/messages/:senderId/:receiverId')
  @ApiOperation({ summary: 'Get all message with a particular user' })
  async getMesagesSenderReceiver(
    @Param('senderId') senderId: string,
    @Param('receiverId') receiverId: string,
  ): Promise<Chat[] | any> {
    const resp = await this.chatService.getMesagesSenderReceiver(
      senderId,
      receiverId,
    );
    return resp;
  }

  // @ApiOperation({ summary: 'Get unread message for user' })
  @Get('/unread/:userId/')
  async getUnreadCountsForUser(
    @Param('userId') userId: string,
  ): Promise<Chat[] | any> {
    const resp = await this.chatService.getUnreadCountsForUser(userId);
    return resp;
  }

  @Patch('/markasRead/:senderId/:receiverId')
  @ApiOperation({ summary: 'Get Mark Messages As Read' })
  async markMessagesAsRead(
    @Param('senderId') senderId: string,
    @Param('receiverId') receiverId: string,
  ): Promise<Chat[] | any> {
    const resp = await this.chatService.markMessagesAsRead(
      senderId,
      receiverId,
    );
    return resp;
  }
}
