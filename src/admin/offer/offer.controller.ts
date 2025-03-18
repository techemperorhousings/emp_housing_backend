import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Get,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import { OfferService } from './offer.service';
import { AdminGuard } from '@guards/admin.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FilterDto, UpdateOfferStatusDto } from './dto/index.dto';

ApiTags('admin/offers');
@ApiBearerAuth('JWT-auth')
@UseGuards(AdminGuard)
@Controller('admin/offers')
export class OfferController {
  constructor(private readonly service: OfferService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all offers with pagination' })
  async getAllOffers(@Query() query: FilterDto) {
    return this.service.getAllOffers(query);
  }
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get specific order details' })
  async getOffer(@Param('id') id: string) {
    return this.service.getOfferById(id);
  }

  @Patch(':id/status/:status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update an offer status (accept, reject, update)',
  })
  async updateOffer(@Param() param: UpdateOfferStatusDto) {
    const { id, status } = param;
    return this.service.updateOfferStatus(id, status);
  }
}
