import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { Roles } from '@decorators/index.decorator';
import { RolesGuard } from '@guards/roles.guard';

@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @ApiOperation({ summary: 'Get all users' })
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Users fetched successfully',
  })
  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  getUsers() {
    return this.service.getAllUsers();
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'User fetched successfully',
  })
  @Get(':id')
  getUser(@Param('id') userId: string) {
    return this.service.getOneUser(userId);
  }

  @ApiOperation({ summary: 'Update user by ID' })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({
    description: 'User details to update',
    type: 'UpdateUserDto',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  updateUser(@Param('id') userId: string, @Body() body) {
    return this.service.updateUser(userId, body);
  }

  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  deleteUser(@Param('id') userId: string) {
    return this.service.deleteUser(userId);
  }
}
