import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
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
  PropertyFilterDto,
  UpdatePropertyDto,
} from './dto/index.dto';
import { Public } from '@decorators/index.decorator';

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
  async findAll(@Query() filters: PropertyFilterDto) {
    console.log(filters);
    return this.propertyService.findAll(filters);
  }

  @Get('user/:userId')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find all properties owned by a user' })
  @ApiParam({ name: 'userId', required: true, description: 'User ID' })
  async findAllByUser(@Param('userId') userId: string) {
    return this.propertyService.findAllByUser(userId);
  }

  @Public()
  @Get('search')
  @ApiOperation({
    summary: 'Search for properties by title, description, or location',
  })
  @ApiQuery({ name: 'query', required: true, description: 'Search keyword' })
  async search(@Query('query') query: string) {
    return this.propertyService.search(query);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Find a property by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Property ID' })
  async findOne(@Param('id') id: string) {
    return this.propertyService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
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

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a property' })
  @ApiParam({ name: 'id', required: true, description: 'Property ID' })
  async delete(@Param('id') id: string) {
    return this.propertyService.deleteProperty(id);
  }
}
