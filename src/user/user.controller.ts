import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { UpdateUserDto } from './dto/index.dto';
import { Permissions } from '@decorators/permission.decorator';
import { PermissionsGuard } from '@guards/permissions.guard';

@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(PermissionsGuard)
export class UserController {
  constructor(private readonly service: UserService) {}

  @ApiOperation({ summary: 'Get user Profile' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'User fetched successfully',
  })
  @Permissions({
    name: 'BOOK_PROPERTY',
    access: ['ADMIN', 'SELLER'],
  })
  @Get(':id/profile')
  getUser(@Param('id') userId: string) {
    return this.service.getOneUser(userId);
  }

  @Patch(':id/profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
  })
  @HttpCode(HttpStatus.OK)
  updateUser(@Param('id') userId: string, @Body() body: UpdateUserDto) {
    return this.service.updateUser(userId, body);
  }

  @ApiOperation({ summary: 'Update user profile picture' })
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    description: 'User profile picture URL',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile picture updated successfully',
  })
  @Patch(':id/picture')
  updateProfilePicture(@Req() req, @Body('pictureUrl') pictureUrl: string) {
    return this.service.updateProfilePicture(req.user.id, pictureUrl);
  }
}
