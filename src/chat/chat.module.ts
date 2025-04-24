import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { JwtModule } from '@nestjs/jwt';
import { PusherModule } from '@pusher/pusher.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    PusherModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
