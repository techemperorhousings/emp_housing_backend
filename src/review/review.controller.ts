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
import {
  ApiOperation,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateReviewDto } from './dto/index.dto';

@ApiTags('Reviews')
@ApiBearerAuth('JWT-auth')
@Controller('review')
export class ReviewController {
  constructor(private readonly service: ReviewService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add review for a property' })
  @ApiBody({ type: CreateReviewDto })
  async createReview(@Body() dto: CreateReviewDto, @Req() req) {
    const userId = req.user.id;
    return this.service.createReview(dto, userId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    description: 'Review ID',
    example: 'REVIEW_ID_123',
    type: 'string',
    name: 'id',
  })
  @ApiOperation({ summary: 'Get a review by ID' })
  async getReviewById(@Param('id') id: string) {
    return this.service.getReviewById(id);
  }

  @Get('property/:propertyId')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    description: 'Property ID',
    example: 'PROPERTY_ID_123',
    type: 'string',
    name: 'propertyId',
  })
  @ApiOperation({ summary: 'Get all reviews for a specific property' })
  async getReviewsByProperty(@Param('propertyId') propertyId: string) {
    return this.service.getReviewsForProperty(propertyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    description: 'Review ID',
    example: 'REVIEW_ID_123',
    type: 'string',
    name: 'id',
  })
  @ApiOperation({ summary: 'Delete own review' })
  async deleteReview(@Param('id') id: string, @Req() req) {
    return this.service.deleteOwnReview(id, req.user.id);
  }
}
