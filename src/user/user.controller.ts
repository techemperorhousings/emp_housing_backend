import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
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
import {
  UpdateUserDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
} from './dto/index.dto';
import { FilterUsersDto } from './dto/FilterUsers.dto';
import { AdminGuard } from '@guards/admin.guard';

@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all users with pagination and filters' })
  async findAll(@Query() query: FilterUsersDto) {
    return this.service.findAll(query);
  }

  @ApiOperation({ summary: 'Get user Profile' })
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

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate or deactivate user' })
  async updateUserStatus(
    @Param('id') id: string,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
  ) {
    return this.service.updateUserStatus(id, updateUserStatusDto);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Change user role' })
  async updateUserRole(
    @Param('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.service.updateUserRole(id, updateUserRoleDto);
  }
}
