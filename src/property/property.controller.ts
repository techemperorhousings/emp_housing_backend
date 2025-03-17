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
import {
  ApiTags,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
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
@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new property' })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({ type: CreatePropertyDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPropertyDto: CreatePropertyDto) {
    return this.propertyService.createProperty(createPropertyDto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
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
  @ApiQuery({
    name: 'skip',
    required: false,
    description: 'Page number',
    type: Number,
    default: 1,
  })
  @ApiQuery({
    name: 'take',
    required: false,
    description: 'Number of items per page',
    type: Number,
    default: 10,
    minimum: 1,
    maximum: 50,
  })
  async findAll(
    @Query() filters: PropertyFilterDto,
    @Query() paginationDto: PaginationQueryDto,
  ) {
    return this.propertyService.findAll(paginationDto, filters);
  }

  @Patch(':id/feature/:featureId')
  @ApiBearerAuth('JWT-auth')
  @OwnerResource('property')
  @UseGuards(OwnerGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a property feature' })
  @ApiParam({ name: 'id', required: true, description: 'Property ID' })
  @ApiParam({ name: 'featureId', required: true, description: 'Feature ID' })
  @ApiBody({ type: FeatureDto })
  async updateFeature(
    @Param('id') propertyId: string,
    @Param('featureId') featureId: string,
    @Body() feature: FeatureDto,
  ) {
    return this.propertyService.updateFeature(propertyId, featureId, feature);
  }

  @Get('user')
  @ApiBearerAuth('JWT-auth')
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
  @ApiQuery({ name: 'query', required: true, description: 'Search keyword' })
  async search(
    @Query('query') query: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.propertyService.search(query, pagination);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Find a property by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Property ID' })
  async findOne(@Param('id') id: string) {
    return this.propertyService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @OwnerResource('property')
  @UseGuards(OwnerGuard)
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

  @Delete(':id/document/:documentId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @OwnerResource('property')
  @UseGuards(OwnerGuard)
  @ApiOperation({ summary: 'Delete a property document' })
  @ApiParam({ name: 'id', required: true, description: 'Property ID' })
  @ApiParam({ name: 'documentId', required: true, description: 'Document ID' })
  async deleteDocument(
    @Param('id') propertyId: string,
    @Param('documentId') documentId: string,
  ) {
    return this.propertyService.removeDocument(propertyId, documentId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @OwnerResource('property')
  @UseGuards(OwnerGuard)
  @ApiOperation({ summary: 'Delete a property' })
  @ApiParam({ name: 'id', required: true, description: 'Property ID' })
  async delete(@Param('id') id: string) {
    return this.propertyService.deleteProperty(id);
  }

  @Delete(':id/image/:imageId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a property image' })
  @ApiParam({ name: 'id', required: true, description: 'Property ID' })
  @ApiParam({ name: 'imageId', required: true, description: 'Image ID' })
  async deleteImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    return this.propertyService.removeImage(id, imageId);
  }

  @Delete(':id/feature/featureId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @OwnerResource('property')
  @UseGuards(OwnerGuard)
  @ApiOperation({ summary: 'Delete a property feature' })
  @ApiParam({ name: 'id', required: true, description: 'Property ID' })
  @ApiParam({ name: 'featureId', required: true, description: 'Feature ID' })
  async deleteFeature(
    @Param('id') propertyId: string,
    @Param('featureId') featureId: string,
  ) {
    return this.propertyService.deleteFeature(propertyId, featureId);
  }
}
