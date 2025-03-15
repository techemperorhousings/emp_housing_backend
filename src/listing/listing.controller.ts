import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ListingService } from './listing.service';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CreateListingDto,
  ListingFilterDto,
  UpdateListingDto,
  UpdateListingStatusDto,
} from './dto/index.dto';
import { ListingStatus } from '@prisma/client';
import { Public } from '@decorators/index.decorator';

@ApiTags('Listings')
@Controller('listings')
export class ListingController {
  constructor(private readonly listingService: ListingService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new listing for a property' })
  @ApiBody({ type: CreateListingDto })
  async create(@Body() dto: CreateListingDto) {
    return this.listingService.createListing(dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Retrieve all listings with optional filters' })
  async findAll(@Query() filters: ListingFilterDto) {
    return this.listingService.findAllListings(filters);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a listing by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Listing ID' })
  async findOne(@Param('id') id: string) {
    return this.listingService.findListingById(id);
  }

  @Public()
  @Get('user/:userId')
  @ApiOperation({ summary: 'Retrieve all listings created by a user' })
  @ApiParam({ name: 'userId', required: true, description: 'User ID' })
  async findByUser(@Param('userId') userId: string) {
    return this.listingService.findListingsByUser(userId);
  }

  @Get('property/:propertyId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Retrieve all listings for a specific property' })
  @ApiParam({ name: 'propertyId', required: true, description: 'Property ID' })
  async findByProperty(@Param('propertyId') propertyId: string) {
    return this.listingService.findListingsByProperty(propertyId);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a listing' })
  @ApiParam({ name: 'id', required: true, description: 'Listing ID' })
  @ApiBody({ type: UpdateListingDto })
  async update(@Param('id') id: string, @Body() dto: UpdateListingDto) {
    return this.listingService.updateListing(id, dto);
  }

  @Put(':id/status/:status')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update the status of a listing' })
  @ApiParam({ name: 'id', required: true, description: 'Listing ID' })
  @ApiParam({
    name: 'status',
    required: true,
    description: 'New status',
    enum: ListingStatus,
  })
  async updateStatus(@Param() params: UpdateListingStatusDto) {
    const { id, status } = params;
    return this.listingService.updateListingStatus(id, status);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a listing' })
  @ApiParam({ name: 'id', required: true, description: 'Listing ID' })
  async delete(@Param('id') id: string) {
    return this.listingService.deleteListing(id);
  }
}
