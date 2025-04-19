import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { ApiOperation, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateReviewDto } from './dto/index.dto';

@ApiTags('Reviews')
@ApiBearerAuth('JWT-auth')
@Controller('review')
export class ReviewController {
  constructor(private readonly service: ReviewService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add review for a property' })
  async createReview(@Body() dto: CreateReviewDto, @Req() req) {
    const userId = req.user.id;
    const review = await this.service.createReview(dto, userId);
    return {
      message: 'Review created successfully',
      ...review,
    };
  }

  @ApiOperation({
    summary: 'Get all reviews',
  })
  @Get()
  async getAllReviews() {
    const reviews = await this.service.getAllReviews();
    return {
      message: 'Reviews fetched successfully',
      ...reviews,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a review by ID' })
  async getReviewById(@Param('id') id: string) {
    const review = await this.service.getReviewById(id);
    return {
      message: 'Review fetched successfully',
      ...review,
    };
  }

  @Get('property/:propertyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all reviews for a specific property' })
  async getReviewsByProperty(@Param('propertyId') propertyId: string) {
    const reviews = await this.service.getReviewsForProperty(propertyId);
    return {
      message: 'Property reviews fetched successfully',
      ...reviews,
    };
  }

  @Delete(':id/user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete own review' })
  async deleteUserReview(@Param('id') id: string, @Req() req) {
    await this.service.deleteOwnReview(id, req.user.id);
    return {
      message: 'Review deleted successfully',
    };
  }

  //delete a review
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a review' })
  async deleteReview(@Param('id') reviewId: string) {
    await this.service.deleteReview(reviewId);
    return {
      message: 'Review deleted successfully',
    };
  }
}
