import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { OfferService } from './offer.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateOfferDto, UpdateOfferStatusDto } from './dto/index.dto';

@ApiTags('Offers')
@ApiBearerAuth('JWT-auth')
@Controller('offer')
export class OfferController {
  constructor(private readonly service: OfferService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Make an offer on a  property listing' })
  async createOffer(@Body() dto: CreateOfferDto) {
    return this.service.createOffer(dto);
  }

  @Get('user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user offers' })
  async getOffersByBuyer(@Req() req) {
    return this.service.getuserOffers(req.user.id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get specific order details' })
  async getOfferById(@Param('id') id: string) {
    return this.service.getOfferById(id);
  }

  @Get('listing/:listingId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all offers for a specific listing' })
  async getOffersByListing(@Param('listingId') listingId: string) {
    return this.service.getOffersByListing(listingId);
  }

  @Patch(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw an offer' })
  async deleteOffer(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return this.service.withdrawOffer({ id, userId });
  }

  @Patch(':id/status/:status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update an offer status (accept, reject, update message)',
  })
  async updateOffer(@Param() param: UpdateOfferStatusDto) {
    const { id, status } = param;
    return this.service.updateOfferStatus(id, status);
  }
}
