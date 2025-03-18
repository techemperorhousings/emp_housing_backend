import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaginationQueryDto } from '@utils/pagination.dto';

@ApiTags('Favorites')
@ApiBearerAuth('JWT-auth')
@Controller('favorite')
export class FavoriteController {
  constructor(private readonly service: FavoriteService) {}

  @Post(':propertyId/toggle')
  @ApiOperation({ summary: 'Toggle favorite for a property' })
  async toggleFavorite(@Req() req, @Param('propertyId') propertyId: string) {
    return this.service.toggleFavorite(req.user.id, { propertyId });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all favorited properties of the user' })
  async getUserFavorites(@Req() req, @Query() pagination: PaginationQueryDto) {
    return this.service.getUserFavorites(req.user.id, pagination);
  }
}
