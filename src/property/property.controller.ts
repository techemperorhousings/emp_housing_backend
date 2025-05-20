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
  DeletePropertyDto,
  PropertyFilterDto,
  PropertyStatusDto,
  ReportPropertyDto,
  UpdatePropertyDto,
} from './dto/index.dto';
import { OwnerResource, Public } from '@decorators/index.decorator';
import { OwnerGuard } from '@guards/owner.guard';
import { PaginationQueryDto } from '@utils/pagination';
import { AdminGuard } from '@guards/admin.guard';

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

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find all properties owned by user' })
  async findAllByUser(
    @Param('userId') userId: string,
    @Query() paginationDto: PaginationQueryDto,
  ) {
    const properties = await this.propertyService.findAllByUser(
      userId,
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

  @Get('request-deletion')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  @ApiOperation({
    summary: 'Get all properties requesting deletion (Admin Only)',
  })
  async getPropertiesRequestingDeletion() {
    const properties =
      await this.propertyService.getPropertiesRequestingDeletion();
    return {
      message: 'Properties requesting deletion fetched successfully',
      ...properties,
    };
  }

  @Get(':id/related')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get related properties' })
  async getRelatedProperties(
    @Param('id') id: string,
    @Query() paginationDto: PaginationQueryDto,
  ) {
    const properties = await this.propertyService.getRelatedProperties(
      id,
      paginationDto,
    );
    return {
      message: 'Related properties fetched successfully',
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

  @Patch(':id/request-deletion')
  @HttpCode(HttpStatus.OK)
  @OwnerResource('property')
  @UseGuards(OwnerGuard)
  @ApiOperation({ summary: 'Request property deletion' })
  async requestDeletion(
    @Param('id') id: string,
    @Body() body: DeletePropertyDto,
  ) {
    const property = await this.propertyService.requestPropertyDeletion(
      id,
      body.reason,
    );
    return {
      message: 'Property deletion requested successfully',
      ...property,
    };
  }

  @Patch(':id/cancel-deletion')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Cancel property deletion (Admin Only)' })
  async cancelDeletion(@Param('id') id: string) {
    const property = await this.propertyService.cancelPropertyDeletion(id);
    return {
      message: 'Property deletion cancelled successfully',
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

  @Delete(':id/approve-deletion')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Approve deletion of a property (Admin Only)' })
  async delete(@Param('id') id: string) {
    await this.propertyService.deleteProperty(id);
    return {
      message: 'Property deleted successfully',
    };
  }

  @Post(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Report a property',
  })
  async reportProperty(
    @Param('id') id: string,
    @Body() body: ReportPropertyDto,
    @Req() req,
  ) {
    const { reason } = body;
    const property = await this.propertyService.reportProperty(
      id,
      req.user.id,
      reason,
    );
    return {
      message: 'Property reported successfully',
      ...property,
    };
  }
}
