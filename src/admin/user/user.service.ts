import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import {
  UpdateUserDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
} from './dto/index.dto';
import { IPaginatedUsers, IUser } from './interfaces/index.interface';
import { PaginationQueryDto } from '@utils/pagination.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationQueryDto): Promise<IPaginatedUsers> {
    const { skip, take } = query;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
        select: this.userObj,
      }),
      this.prisma.user.count(),
    ]);

    return {
      message: 'Users fetched successfully',
      data: users,
      total,
      skip,
      take,
    };
  }

  //get one user
  async getUser(userId: string): Promise<{ message: string; data: IUser }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: this.userObj,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      message: 'User fetched successfully',
      data: user,
    };
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<{ message: string; data: IUser }> {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: this.userObj,
    });
    return {
      message: 'User updated successfully',
      data: user,
    };
  }

  async updateUserStatus(
    id: string,
    updateUserStatusDto: UpdateUserStatusDto,
  ): Promise<{ message: string; data: IUser }> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        isActive: updateUserStatusDto.isActive,
      },
      select: this.userObj,
    });
    return {
      message: 'User status updated successfully',
      data: user,
    };
  }

  async updateUserRole(
    id: string,
    updateUserRoleDto: UpdateUserRoleDto,
  ): Promise<{ message: string; data: IUser }> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        roleId: updateUserRoleDto.roleId,
      },
      select: this.userObj,
    });
    return {
      message: 'User role updated successfully',
      data: user,
    };
  }

  private userObj = {
    id: true,
    email: true,
    username: true,
    firstname: true,
    lastname: true,
    roleId: true,
    isActive: true,
    phoneNumber: true,
    profileImage: true,
    verified: true,
    kycVerified: true,
    createdAt: true,
    updatedAt: true,
  };
}
