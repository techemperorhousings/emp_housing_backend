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
  PropertyFilterDto,
  PropertyStatusDto,
  UpdatePropertyDto,
} from './dto/index.dto';
import { OwnerResource, Public } from '@decorators/index.decorator';
import { OwnerGuard } from '@guards/owner.guard';
import { PaginationQueryDto } from '@utils/pagination';

@ApiTags('Properties')
@ApiBearerAuth('JWT-auth')
@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new property' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPropertyDto: CreatePropertyDto, @Req() req) {
    const payload = {
      ...createPropertyDto,
      ownerId: req.user.id,
    };
    const property = await this.propertyService.createProperty(payload);
    return {
      message: 'Property created successfully',
      ...property,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find all properties with optional filters' })
  async findAll(@Query() filters: PropertyFilterDto) {
    const properties = await this.propertyService.findAll(filters);
    return {
      message: 'Properties fetched successfully',
      ...properties,
    };
  }

  @Patch(':id/status/:status')
  @HttpCode(HttpStatus.OK)
  @HttpCode(HttpStatus.OK)
  async updateStatus(@Param() param: PropertyStatusDto) {
    const { id, status } = param;
    const property = await this.propertyService.updatePropertyStatus(
      id,
      status,
    );
    return {
      message: 'Property status updated successfully',
      ...property,
    };
  }

  @Get('user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find all properties owned by user' })
  async findAllByUser(@Req() req, @Query() paginationDto: PaginationQueryDto) {
    const properties = await this.propertyService.findAllByUser(
      req.user.id,
      paginationDto,
    );
    return {
      message: 'Properties fetched successfully',
      ...properties,
    };
  }

  @Public()
  @Get('search')
  @ApiOperation({
    summary: 'Search for properties by title, description, or location',
  })
  async search(@Query('query') query: string) {
    const properties = await this.propertyService.search(query);
    return {
      message: 'Properties found successfully',
      ...properties,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a property by ID' })
  async findOne(@Param('id') id: string) {
    const property = await this.propertyService.findOne(id);
    return {
      message: 'Property fetched successfully',
      ...property,
    };
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
    const property = await this.propertyService.updateProperty(
      id,
      updatePropertyDto,
    );
    return {
      message: 'Property updated successfully',
      ...property,
    };
  }
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @OwnerResource('property')
  @UseGuards(OwnerGuard)
  @ApiOperation({ summary: 'Delete a property' })
  async delete(@Param('id') id: string) {
    await this.propertyService.deleteProperty(id);
    return {
      message: 'Property deleted successfully',
    };
  }
}
