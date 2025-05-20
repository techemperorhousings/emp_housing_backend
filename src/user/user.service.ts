import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import {
  UpdateUserDto,
  UpdateUserRoleDto,
  UpdateUserStatusDto,
} from './dto/index.dto';
import { FilterUsersDto } from './dto/FilterUsers.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: FilterUsersDto) {
    const { skip, take, search, isActive, verified, role } = query;

    const where: Prisma.UserWhereInput = {
      ...(search && {
        OR: [
          { firstname: { contains: search, mode: 'insensitive' } },
          { lastname: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(isActive !== undefined && {
        isActive: isActive === 'true',
      }),
      ...(verified !== undefined && {
        verified: verified === 'true',
      }),
      ...(role && {
        role: {
          name: { equals: role, mode: 'insensitive' },
        },
      }),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        where,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count({
        where: where,
      }),
    ]);

    // Remove password from each user
    const safeUsers = users.map(({ password, ...user }) => user);

    return {
      data: safeUsers,
      total,
      skip,
      take,
    };
  }

  //get one user
  async getOneUser(userId: string): Promise<Record<string, any>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Remove password before returning
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Record<string, any>> {
    await this.getOneUser(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
    // Remove password before returning
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async updateUserStatus(
    id: string,
    updateUserStatusDto: UpdateUserStatusDto,
  ): Promise<Record<string, any>> {
    await this.getOneUser(id);
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        isActive: updateUserStatusDto.isActive,
      },
    });
    // Remove password before returning
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async updateUserRole(
    id: string,
    updateUserRoleDto: UpdateUserRoleDto,
  ): Promise<Record<string, any>> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        roleId: updateUserRoleDto.role,
      },
    });
    const { password, ...safeUser } = user;
    return safeUser;
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
    const { password, ...safeUser } = user;
    return { message: 'Profile picture updated successfully', data: safeUser };
  }
}
