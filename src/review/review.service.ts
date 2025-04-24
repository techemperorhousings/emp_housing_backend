import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateReviewDto } from './dto/index.dto';
import { Review } from '@prisma/client';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(dto: CreateReviewDto, userId: string): Promise<Review> {
    // Ensure user and property exists
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });

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

    return review;
  }

  //get all reviews
  async getAllReviews(): Promise<Review[]> {
    return await this.prisma.review.findMany({});
  }

  async getReviewById(id: string): Promise<Review> {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: { user: true, property: true },
    });
    if (!review) throw new NotFoundException('Review not found');

    return review;
  }

  async getReviewsForProperty(propertyId: string): Promise<Review[]> {
    return await this.prisma.review.findMany({
      where: { propertyId },
      include: { user: true },
    });
  }

  //delete own review
  async deleteOwnReview(id: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review || review.userId !== userId) {
      throw new NotFoundException('Review not found or not owned by the user');
    }

    return await this.prisma.review.delete({
      where: { id },
    });
  }

  //delete a review
  async deleteReview(reviewId: string) {
    return await this.prisma.review.delete({
      where: { id: reviewId },
    });
  }
}
