import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { PaginationQueryDto } from '@utils/pagination.dto';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  //get all reviews
  async getAllReviews(pagination: PaginationQueryDto) {
    const { skip, take } = pagination;
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        skip,
        take,
      }),
      await this.prisma.review.count(),
    ]);

    return {
      reviews,
      total,
      skip,
      take,
    };
  }

  //delete a review
  async deleteReview(reviewId: string) {
    await this.prisma.review.delete({
      where: { id: reviewId },
    });

    return 'Review deleted successfully';
  }
}
