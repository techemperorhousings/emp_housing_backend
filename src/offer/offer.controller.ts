import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { OfferService } from './offer.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreateOfferDto,
  FilterDto,
  UpdateOfferStatusDto,
} from './dto/index.dto';

@ApiTags('Offers')
@ApiBearerAuth('JWT-auth')
@Controller('offer')
export class OfferController {
  constructor(private readonly service: OfferService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Make an offer on a  property' })
  async createOffer(@Body() dto: CreateOfferDto) {
    const offer = await this.service.createOffer(dto);
    return {
      message: 'Offer created successfully',
      ...offer,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all offers with pagination' })
  async getAllOffers(@Query() query: FilterDto) {
    const offers = await this.service.getAllOffers(query);
    return {
      message: 'Offers fetched successfully',
      ...offers,
    };
  }

  @Get('user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get user offers' })
  async getOffersByBuyer(@Req() req) {
    const offers = await this.service.getuserOffers(req.user.id);
    return {
      message: 'User offers fetched successfully',
      ...offers,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get specific order details' })
  async getOfferById(@Param('id') id: string) {
    const offer = await this.service.getOfferById(id);
    return {
      message: 'Offer fetched successfully',
      ...offer,
    };
  }

  @Get('property/:propertyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all offers for a specific property' })
  async getOffersOnProperty(@Param('propertyId') propertyId: string) {
    const offers = await this.service.getOffersByListing(propertyId);
    return {
      message: 'Offers fetched successfully',
      data: offers,
    };
  }

  @Patch(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw an offer' })
  async deleteOffer(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    const offer = await this.service.withdrawOffer({ id, userId });
    return {
      message: 'Offer withdrawn successfully',
      ...offer,
    };
  }

  @Patch(':id/status/:status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update an offer status (accept, reject, update message)',
  })
  async updateOffer(@Param() param: UpdateOfferStatusDto) {
    const { id, status } = param;
    const offer = await this.service.updateOfferStatus(id, status);
    return {
      message: 'Offer status updated successfully',
      ...offer,
    };
  }
}
