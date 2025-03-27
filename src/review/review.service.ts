import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateReviewDto } from './dto/index.dto';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(dto: CreateReviewDto, userId: string) {
    // Ensure user and property exists
    const [user, property] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
      }),
      this.prisma.property.findUnique({
        where: { id: dto.propertyId },
      }),
    ]);
    if (!user) throw new NotFoundException('User not found');

    if (!property) throw new NotFoundException('Property not found');

    // Use Prisma's upsert to update if exists, otherwise create a new review
    const review = await this.prisma.review.upsert({
      where: {
        userId_propertyId: {
          userId,
          propertyId: dto.propertyId,
        },
      },
      update: {
        rating: dto.rating,
        comment: dto.comment,
        updatedAt: new Date(),
      },
      create: {
        userId,
        propertyId: dto.propertyId,
        rating: dto.rating,
        comment: dto.comment,
      },
    });

    return {
      message: 'Review created successfully',
      review,
    };
  }

  async getReviewById(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: { user: true, property: true },
    });
    if (!review) throw new NotFoundException('Review not found');

    return {
      message: 'Review fetched successfully',
      data: review,
    };
  }

  async getReviewsForProperty(propertyId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { propertyId },
      include: { user: true },
    });
    return {
      message: 'Reviews fetched successfully',
      data: reviews,
    };
  }

  //delete own review
  async deleteOwnReview(id: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review || review.userId !== userId) {
      throw new NotFoundException('Review not found or not owned by the user');
    }

    await this.prisma.review.delete({
      where: { id },
    });

    return {
      message: 'Review deleted successfully',
    };
  }
}
