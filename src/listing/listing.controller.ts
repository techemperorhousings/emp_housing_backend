import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { ListingService } from './listing.service';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import {
  ActiveStatusDto,
  CreateListingDto,
  ListingFilterDto,
  UpdateListingDto,
} from './dto/index.dto';
import { Public, OwnerResource } from '@decorators/index.decorator';
import { OwnerGuard } from '@guards/owner.guard';
import { PaginationQueryDto } from '@utils/pagination.dto';

@ApiTags('Listing')
@Controller('listing')
export class ListingController {
  constructor(private readonly listingService: ListingService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new listing for a property' })
  async create(@Body() dto: CreateListingDto) {
    return this.listingService.createListing(dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Retrieve all listings with optional filters' })
  async findAll(@Query() filters: ListingFilterDto) {
    return this.listingService.findAllListings(filters);
  }

  @Get('user')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Retrieve all listings created by a user' })
  async findByUser(@Req() req, @Query() pagination: PaginationQueryDto) {
    return this.listingService.findListingsByUser(req.user.id, pagination);
  }

  @Get('property/:propertyId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Retrieve all listings for a specific property' })
  async findByProperty(
    @Param('propertyId') propertyId: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.listingService.findListingsByProperty(propertyId, pagination);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a listing by ID' })
  async findOne(@Param('id') id: string) {
    return this.listingService.findListingById(id);
  }

  @Patch(':id/status')
  @ApiBearerAuth('JWT-auth')
  @OwnerResource('listing')
  @UseGuards(OwnerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update the status of a listing' })
  @ApiBody({
    type: ActiveStatusDto,
  })
  async updateStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.listingService.updateListingStatus(id, isActive);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @OwnerResource('listing')
  @UseGuards(OwnerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a listing' })
  async update(@Param('id') id: string, @Body() dto: UpdateListingDto) {
    return this.listingService.updateListing(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @OwnerResource('listing')
  @UseGuards(OwnerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a listing' })
  async delete(@Param('id') id: string) {
    return this.listingService.deleteListing(id);
  }
}
