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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from '@guards/admin.guard';
import {
  PropertyFilterDto,
  PropertyStatusDto,
  UpdatePropertyDto,
} from './dto/index.dto';

@ApiTags('Admin Propery')
@ApiBearerAuth('JWT-auth')
@UseGuards(AdminGuard)
@Controller('admin/property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Find all properties with optional filters' })
  async findAll(@Query() filters: PropertyFilterDto) {
    return this.propertyService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find a property by ID' })
  async findOne(@Param('id') id: string) {
    return this.propertyService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a property' })
  async update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
  ) {
    return this.propertyService.updateProperty(id, updatePropertyDto);
  }

  @Patch(':id/status/:status')
  @HttpCode(HttpStatus.OK)
  @HttpCode(HttpStatus.OK)
  async updateStatus(@Param() param: PropertyStatusDto) {
    const { id, status } = param;
    return this.propertyService.updatePropertyStatus(id, status);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a property' })
  async delete(@Param('id') id: string) {
    return this.propertyService.deleteProperty(id);
  }
}
