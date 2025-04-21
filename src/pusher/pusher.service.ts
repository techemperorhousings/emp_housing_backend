import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Pusher from 'pusher';

@Injectable()
export class PusherService {
  private pusher: Pusher;

  constructor(private configService: ConfigService) {
    this.pusher = new Pusher({
      appId: this.configService.get<string>('PUSHER_APP_ID'),
      key: this.configService.get<string>('PUSHER_KEY'),
      secret: this.configService.get<string>('PUSHER_SECRET'),
      cluster: this.configService.get<string>('PUSHER_CLUSTER'),
      useTLS: true,
    });
  }

  async trigger(channel: string, event: string, data: any) {
    return this.pusher.trigger(channel, event, data);
  }

  // Add authentication for private channels
  async authorizeChannel(socketId: string, channel: string, userId: string) {
    // Only authorize if the channel belongs to this user
    if (channel === `private-user-${userId}`) {
      return this.pusher.authorizeChannel(socketId, channel);
    }

    return { auth: '' }; // unauthorized
  }
}
