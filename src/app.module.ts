import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from '@guards/jwt.guard';
import { APP_GUARD } from '@nestjs/core';
import { modules } from '@modules';
import { adminModules } from '@admin/modules';

@Module({
  imports: [...modules, ...adminModules],
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
