import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreatePurchaseDto, UpdatePurchaseStatusDto } from './dto/index.dto';
import { PurchaseStatus } from '@prisma/client';

@ApiTags('Purchases')
@Controller('purchases')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new property purchase' })
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreatePurchaseDto })
  async create(@Body() createPurchaseDto: CreatePurchaseDto) {
    return this.purchaseService.create(createPurchaseDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all purchases' })
  async findAll() {
    return this.purchaseService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a purchase by ID' })
  async findOne(@Param('id') id: string) {
    return this.purchaseService.findOne(id);
  }

  @Get('user/:userId')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all purchases for a specific user' })
  async findByUser(@Param('userId') userId: string) {
    return this.purchaseService.findByUser(userId);
  }

  @Patch(':id/status/:status')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a purchase status' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The ID of the purchase to update status',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'status',
    enum: PurchaseStatus,
    description: 'The new status for the purchase',
    example: 'PAID',
  })
  async update(@Param() params: UpdatePurchaseStatusDto) {
    return this.purchaseService.update(params);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a purchase' })
  async delete(@Param('id') id: string) {
    return this.purchaseService.delete(id);
  }
  @Get('filter/status')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({
    name: 'status',
    enum: PurchaseStatus,
    description: 'The new status for the purchase',
    example: 'PAID',
  })
  @ApiOperation({ summary: 'Filter purchases by status' })
  async filterByStatus(@Query('status') status: PurchaseStatus) {
    return this.purchaseService.filterByStatus(status);
  }
}
