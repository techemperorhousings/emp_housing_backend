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
          name: { equals: role.toUpperCase(), mode: 'insensitive' },
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
        include: this.includeObj,
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
      include: this.includeObj,
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
      include: this.includeObj,
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
      include: this.includeObj,
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
      include: this.includeObj,
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
      include: this.includeObj,
    });
    const { password, ...safeUser } = user;
    return { message: 'Profile picture updated successfully', data: safeUser };
  }

  /******** dashboard services ***************/

  async getDashboardOverview(userId: string): Promise<any> {
    const isAdmin = await this.isAdmin(userId);

    if (isAdmin) {
      const [platformGrowth, propertyInventory] = await Promise.all([
        this.getPlatformGrowth(),
        this.getPropertyInventory(),
      ]);

      return {
        role: 'ADMIN',
        platformGrowth,
        propertyInventory,
      };
    } else {
      const userOverview = await this.getOverviewUser(userId);
      return {
        role: 'USER',
        ...userOverview,
      };
    }
  }

  private async isAdmin(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: { select: { name: true } } },
    });
    return user?.role?.name === 'ADMIN';
  }

  async getOverviewUser(userId: string): Promise<{
    totalApprovedListings: number;
    totalSoldProperties: number;
    totalDraftListings: number;
    averageViewsPerListing: number;
    portfolioValue: number;
  }> {
    const [approved, sold, draft, allProperties] = await Promise.all([
      this.prisma.property.count({
        where: { ownerId: userId, status: 'APPROVED' },
      }),
      this.prisma.property.count({
        where: { ownerId: userId, status: 'PENDING' },
      }),
      this.prisma.property.count({
        where: { ownerId: userId, status: 'REJECTED' },
      }),
      this.prisma.property.findMany({
        where: { ownerId: userId },
        select: { price: true, views: true },
      }),
    ]);

    const totalProperties = allProperties.length;

    const totalViews = allProperties.reduce((acc, p) => acc + p.views, 0);

    const averageViews = totalProperties ? totalViews / totalProperties : 0;

    const portfolioValue = allProperties.reduce(
      (acc, p) => acc + Number(p.price),
      0,
    );

    return {
      totalApprovedListings: approved,
      totalSoldProperties: sold,
      totalDraftListings: draft,
      averageViewsPerListing: averageViews,
      portfolioValue,
    };
  }

  async getPlatformGrowth(): Promise<{
    totalUsers: number;
    newRegistrationsThisMonth: number;
    userGrowthRate: number;
  }> {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(startOfThisMonth.getTime() - 1);

    const [totalUsers, newThisMonth, lastMonth] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { createdAt: { gte: startOfThisMonth } },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),
    ]);

    const userGrowthRate =
      lastMonth === 0 ? 100 : ((newThisMonth - lastMonth) / lastMonth) * 100;

    return {
      totalUsers,
      newRegistrationsThisMonth: newThisMonth,
      userGrowthRate,
    };
  }

  async getPropertyInventory(): Promise<{
    totalApprovedListings: number;
    newListingsToday: number;
    newListingsThisWeek: number;
    inventoryTurnover: number;
  }> {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfWeek = new Date(now);
    startOfWeek.setDate(startOfWeek.getDate() - now.getDay()); // Sunday

    const [active, today, thisWeek, sold] = await Promise.all([
      this.prisma.property.count({ where: { status: 'APPROVED' } }),
      this.prisma.property.count({
        where: { createdAt: { gte: startOfToday } },
      }),
      this.prisma.property.count({
        where: { createdAt: { gte: startOfWeek } },
      }),
      this.prisma.property.count({ where: { listingStatus: 'SOLD' } }),
    ]);

    const totalListings = await this.prisma.property.count();
    const inventoryTurnover =
      totalListings === 0 ? 0 : (sold / totalListings) * 100;

    return {
      totalApprovedListings: active,
      newListingsToday: today,
      newListingsThisWeek: thisWeek,
      inventoryTurnover,
    };
  }

  includeObj = {
    role: {
      select: {
        name: true,
      },
    },
  };
}
