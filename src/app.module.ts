import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from '@guards/jwt.guard';
import { APP_GUARD } from '@nestjs/core';
import { modules } from '@modules';
import { PusherModule } from './pusher/pusher.module';

@Module({
  imports: [...modules],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
