import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import {
  UpdateUserDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
} from './dto/index.dto';
import { PaginatedResponse, PaginationQueryDto } from '@utils/pagination';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto): Promise<PaginatedResponse<User>> {
    const { skip, take } = query;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      total,
      skip,
      take,
    };
  }

  //get one user
  async getOneUser(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.getOneUser(id);
    return await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async updateUserStatus(
    id: string,
    updateUserStatusDto: UpdateUserStatusDto,
  ): Promise<User> {
    await this.getOneUser(id);
    return await this.prisma.user.update({
      where: { id },
      data: {
        isActive: updateUserStatusDto.isActive,
      },
    });
  }

  async updateUserRole(
    id: string,
    updateUserRoleDto: UpdateUserRoleDto,
  ): Promise<User> {
    return await this.prisma.user.update({
      where: { id },
      data: {
        roleId: updateUserRoleDto.role,
      },
    });
  }
  //delete a user
  async deleteUser(userId: string): Promise<{ message: string }> {
    await this.getOneUser(userId);
    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
    return { message: 'User deleted successfully' };
  }

  //update profile picture
  async updateProfilePicture(
    userId: string,
    pictureUrl: string,
  ): Promise<{ message: string; data: any }> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { profileImage: pictureUrl },
    });
    return { message: 'Profile picture updated successfully', data: user };
  }
}
