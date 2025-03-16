import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @ApiOperation({ summary: 'Get user Profile' })
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'User fetched successfully',
  })
  @Get(':id/profile')
  getUser(@Param('id') userId: string) {
    return this.service.getOneUser(userId);
  }

  @Patch(':id/profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiBody({
    description: 'User details to update',
    type: 'UpdateUserDto',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'User ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
  })
  @HttpCode(HttpStatus.OK)
  updateUser(@Param('id') userId: string, @Body() body) {
    return this.service.updateUser(userId, body);
  }

  @ApiOperation({ summary: 'Update user profile picture' })
  @ApiBearerAuth('JWT-auth')
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
