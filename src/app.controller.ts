import { Controller, Get, HttpCode, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@decorators/index.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('seed')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Seed database with initial data' })
  @ApiResponse({ status: 200, description: 'Database seeded successfully' })
  async seed() {
    return this.appService.seed();
  }
}
