import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { PaginationQueryDto } from '@utils/pagination.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '@guards/admin.guard';

@ApiTags('Admin Reviews')
@ApiBearerAuth('JWT-auth')
@UseGuards(AdminGuard)
@Controller('admin/reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @ApiOperation({
    summary: 'Get all reviews with pagination',
  })
  @Get()
  async getAllReviews(@Query() pagination: PaginationQueryDto) {
    return await this.reviewService.getAllReviews(pagination);
  }

  //delete a review
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a review' })
  async deleteReview(@Param('id') reviewId: string) {
    return this.reviewService.deleteReview(reviewId);
  }
}
