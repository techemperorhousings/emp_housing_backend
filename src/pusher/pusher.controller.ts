import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { PusherService } from './pusher.service';
import { JwtAuthGuard } from '@guards/jwt.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PusherAuthDto } from './dto/index.dto';

@ApiTags('Pusher')
@Controller('pusher')
export class PusherController {
  constructor(private readonly pusherService: PusherService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('auth')
  @ApiOperation({ summary: 'Authorize user for a private Pusher channel' })
  async authorizeChannel(@Req() req, @Body() body: PusherAuthDto) {
    return this.pusherService.authorizeChannel(
      body.socket_id,
      body.channel_name,
      req.user.id,
    );
  }
}
