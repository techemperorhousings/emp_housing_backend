import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { UpdateUserDto } from './dto/index.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

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

  //get one user
  async getOneUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User fetched successfully',
      data: user,
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
