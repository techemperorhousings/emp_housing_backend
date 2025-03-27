import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { PropertyService } from './property.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  CreatePropertyDto,
  FeatureDto,
  PropertyFilterDto,
  UpdatePropertyDto,
} from './dto/index.dto';
import { OwnerResource, Public } from '@decorators/index.decorator';
import { OwnerGuard } from '@guards/owner.guard';
import { PaginationQueryDto } from '@utils/pagination.dto';

@ApiTags('Properties')
@ApiBearerAuth('JWT-auth')
@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new property' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPropertyDto: CreatePropertyDto) {
    return this.propertyService.createProperty(createPropertyDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find all properties with optional filters' })
  async findAll(@Query() filters: PropertyFilterDto) {
    return this.propertyService.findAll(filters);
  }

  @Patch(':id/feature/:featureId')
  @OwnerResource('property')
  @UseGuards(OwnerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a property feature' })
  async updateFeature(
    @Param('id') propertyId: string,
    @Param('featureId') featureId: string,
    @Body() feature: FeatureDto,
  ) {
    return this.propertyService.updateFeature(propertyId, featureId, feature);
  }

  @Get('user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find all properties owned by user' })
  async findAllByUser(@Req() req, @Query() paginationDto: PaginationQueryDto) {
    return this.propertyService.findAllByUser(req.user.id, paginationDto);
  }

  @Public()
  @Get('search')
  @ApiOperation({
    summary: 'Search for properties by title, description, or location',
  })
  async search(
    @Query('query') query: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.propertyService.search(query, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a property by ID' })
  async findOne(@Param('id') id: string) {
    return this.propertyService.findOne(id);
  }

  @Patch(':id')
  @OwnerResource('property')
  @UseGuards(OwnerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a property' })
  async update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertyService.updateProperty(id, updatePropertyDto);
  }

  @Delete(':id/document/:documentId')
  @HttpCode(HttpStatus.OK)
  @OwnerResource('property')
  @UseGuards(OwnerGuard)
  @ApiOperation({ summary: 'Delete a property document' })
  async deleteDocument(
    @Param('id') propertyId: string,
    @Param('documentId') documentId: string,
  ) {
    return this.propertyService.removeDocument(propertyId, documentId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @OwnerResource('property')
  @UseGuards(OwnerGuard)
  @ApiOperation({ summary: 'Delete a property' })
  async delete(@Param('id') id: string) {
    return this.propertyService.deleteProperty(id);
  }

  @Delete(':id/image/:imageId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a property image' })
  async deleteImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    return this.propertyService.removeImage(id, imageId);
  }

  @Delete(':id/feature/featureId')
  @HttpCode(HttpStatus.OK)
  @OwnerResource('property')
  @UseGuards(OwnerGuard)
  @ApiOperation({ summary: 'Delete a property feature' })
  async deleteFeature(
    @Param('id') propertyId: string,
    @Param('featureId') featureId: string,
  ) {
    return this.propertyService.deleteFeature(propertyId, featureId);
  }
}
