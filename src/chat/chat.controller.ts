import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('chats')
@Controller('chats')
export class ChatController {
  constructor(private readonly service: ChatService) {}

  @ApiOperation({ summary: 'Get all messages exchanged with a specific user' })
  @ApiParam({
    name: 'userId',
    type: String,
    description: 'ID of the other user',
  })
  @Get(':userId')
  async getMessagesWith(@Req() req, @Param('userId') otherUserId: string) {
    return this.service.getConversation(req.user.id, otherUserId);
  }

  @ApiOperation({ summary: 'Send a message to a specific user' })
  @ApiParam({ name: 'userId', type: String, description: 'Receiver ID' })
  @ApiBody({ schema: { example: { content: 'Hello there!' } } })
  @Post(':userId')
  async sendMessage(
    @Req() req,
    @Param('userId') receiverId: string,
    @Body() body: { content: string },
  ) {
    return this.service.sendMessage(req.user.id, receiverId, body.content);
  }

  @ApiOperation({ summary: 'Mark all messages from a user as read' })
  @ApiParam({
    name: 'senderId',
    type: String,
    description: 'Sender ID of the messages to mark as read',
  })
  @Post(':senderId/read')
  async markAsRead(@Req() req, @Param('senderId') senderId: string) {
    return this.service.markMessagesAsRead(senderId, req.user.id);
  }

  //get all user conversations
  @ApiOperation({ summary: 'Get all conversations of the authenticated user' })
  @Post('/conversations')
  async getConversations(@Req() req) {
    return this.service.getConversations(req.user.id);
  }

  //delete a message
  @ApiOperation({ summary: 'Delete a message by ID' })
  @ApiParam({
    name: 'messageId',
    type: String,
    description: 'ID of the message to delete',
  })
  @Post(':messageId/delete')
  async deleteMessage(@Param('messageId') messageId: string) {
    return this.service.deleteMessage(messageId);
  }
}
