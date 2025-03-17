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
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
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

  @Get('user')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Retrieve all listings created by a user' })
  async findByUser(@Req() req, @Query() pagination: PaginationQueryDto) {
    return this.listingService.findListingsByUser(req.user.id, pagination);
  }

  @Get('property/:propertyId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Retrieve all listings for a specific property' })
  @ApiParam({ name: 'propertyId', required: true, description: 'Property ID' })
  async findByProperty(
    @Param('propertyId') propertyId: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.listingService.findListingsByProperty(propertyId, pagination);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a listing by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Listing ID' })
  async findOne(@Param('id') id: string) {
    return this.listingService.findListingById(id);
  }

  @Patch(':id/status')
  @ApiBearerAuth('JWT-auth')
  @OwnerResource('listing')
  @UseGuards(OwnerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update the status of a listing' })
  @ApiParam({ name: 'id', required: true, description: 'Listing ID' })
  @ApiBody({
    type: ActiveStatusDto,
  })
  async updateStatus(@Param() param, @Body('isActive') isActive: boolean) {
    const { id } = param;
    return this.listingService.updateListingStatus(id, isActive);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @OwnerResource('listing')
  @UseGuards(OwnerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a listing' })
  @ApiParam({ name: 'id', required: true, description: 'Listing ID' })
  @ApiBody({ type: UpdateListingDto })
  async update(@Param('id') id: string, @Body() dto: UpdateListingDto) {
    return this.listingService.updateListing(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @OwnerResource('listing')
  @UseGuards(OwnerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a listing' })
  @ApiParam({ name: 'id', required: true, description: 'Listing ID' })
  async delete(@Param('id') id: string) {
    return this.listingService.deleteListing(id);
  }
}
