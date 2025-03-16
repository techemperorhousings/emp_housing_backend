import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { UpdateUserDto } from './dto/index.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  //get all users
  async getAllUsers(): Promise<{ message: string; data: User[] }> {
    const users = await this.prisma.user.findMany();
    return {
      message: 'Users fetched successfully',
      data: users,
    };
  }

  //get one user
  async getOneUser(userId: string): Promise<{ message: string; data: User }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      message: 'User fetched successfully',
      data: user,
    };
  }

  //update user
  async updateUser(
    userId: string,
    body: UpdateUserDto,
  ): Promise<{ message: string; data: User }> {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: body,
    });

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User updated successfully',
      data: updatedUser,
    };
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
