import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateFavoriteDto } from './dto/index.dto';

@Injectable()
export class FavoriteService {
  constructor(private readonly prisma: PrismaService) {}

  async toggleFavorite(userId: string, dto: CreateFavoriteDto) {
    // Check if property exists
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Check if the favorite already exists
    const existingFavorite = await this.prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId: dto.propertyId,
        },
      },
    });

    if (existingFavorite) {
      // Remove favorite if it already exists
      await this.prisma.favorite.delete({
        where: {
          userId_propertyId: {
            userId,
            propertyId: dto.propertyId,
          },
        },
      });
      return { message: 'Property removed from favorites', isFavorite: false };
    } else {
      // Add to favorites
      await this.prisma.favorite.create({
        data: {
          userId,
          propertyId: dto.propertyId,
        },
      });
      return { message: 'Property added to favorites', isFavorite: true };
    }
  }

  async getUserFavorites(userId: string, pagination) {
    const { skip, take } = pagination;
    const [favorites, total] = await Promise.all([
      this.prisma.favorite.findMany({
        skip,
        take,
        where: { userId },
        include: { property: true }, // Include property details
      }),
      this.prisma.favorite.count({ where: { userId } }),
    ]);
    return {
      message: 'Favorites fetched successfully',
      data: favorites,
      total,
      skip,
      take,
    };
  }
}
