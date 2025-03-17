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
import { PropertyService } from './property.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AdminGuard } from '@guards/admin.guard';
import { PropertyFilterDto, UpdatePropertyDto } from './dto/index.dto';
import { PropertyStatus } from '@prisma/client';

@ApiTags('admin/property')
@ApiBearerAuth('JWT-auth')
@UseGuards(AdminGuard)
@Controller('admin/property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find all properties with optional filters' })
  @ApiQuery({
    name: 'location',
    required: false,
    description: 'Filter by location',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by property type',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    description: 'Minimum price filter',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    description: 'Maximum price filter',
  })
  async findAll(@Query() filters: PropertyFilterDto) {
    return this.propertyService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a property by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Property ID' })
  async findOne(@Param('id') id: string) {
    return this.propertyService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a property' })
  @ApiParam({ name: 'id', required: true, description: 'Property ID' })
  @ApiBody({ type: UpdatePropertyDto })
  async update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertyService.updateProperty(id, updatePropertyDto);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update the status of a property' })
  @ApiParam({ name: 'id', required: true, description: 'Property ID' })
  @ApiQuery({
    name: 'status',
    required: true,
    description: 'New status',
    enum: PropertyStatus,
  })
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Query('status') status: PropertyStatus,
  ) {
    return this.propertyService.updatePropertyStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a property' })
  @ApiParam({ name: 'id', required: true, description: 'Property ID' })
  async delete(@Param('id') id: string) {
    return this.propertyService.deleteProperty(id);
  }
}
