import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CreatePurchaseDto, UpdatePurchaseStatusDto } from './dto/index.dto';
import { PurchaseStatus } from '@prisma/client';

@ApiTags('Purchases')
@ApiBearerAuth('JWT-auth')
@Controller('purchases')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new property purchase' })
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: CreatePurchaseDto })
  async create(@Body() createPurchaseDto: CreatePurchaseDto) {
    return this.purchaseService.create(createPurchaseDto);
  }

  @Get('user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all purchases for a specific user' })
  async findByUser(@Req() req) {
    return this.purchaseService.findUserPurchases(req.user.id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a purchase details' })
  async findOne(@Param('id') id: string) {
    return this.purchaseService.findOne(id);
  }

  @Patch(':id/status/:status')
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
}
