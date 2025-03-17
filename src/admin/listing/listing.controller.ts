import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ListingService } from './listing.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AdminGuard } from '@guards/admin.guard';
import { PaginationQueryDto } from '@utils/pagination.dto';
import { ListingStatus } from '@prisma/client';
import { ListingFilterDto, UpdateListingDto } from './dto/index.dto';

@ApiTags('admin/listing')
@ApiBearerAuth('JWT-auth')
@UseGuards(AdminGuard)
@Controller('admin/listing')
export class ListingController {
  constructor(private readonly listingService: ListingService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all listings with optional filters' })
  async findAll(@Query() filters: ListingFilterDto) {
    return this.listingService.findAllListings(filters);
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

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a listing by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Listing ID' })
  async findOne(@Param('id') id: string) {
    return this.listingService.findListingById(id);
  }

  @Patch(':id/status/:status')
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
  async updateStatus(@Param() param) {
    const { id, status } = param;
    return this.listingService.updateListingStatus(id, status);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a listing' })
  @ApiParam({ name: 'id', required: true, description: 'Listing ID' })
  @ApiBody({ type: UpdateListingDto })
  async update(@Param('id') id: string, @Body() dto: UpdateListingDto) {
    return this.listingService.updateListing(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a listing' })
  @ApiParam({ name: 'id', required: true, description: 'Listing ID' })
  async delete(@Param('id') id: string) {
    return this.listingService.deleteListing(id);
  }
}
