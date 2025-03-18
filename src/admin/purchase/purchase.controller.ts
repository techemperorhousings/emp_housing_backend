import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FilterDto, UpdatePurchaseStatusDto } from './dto/index.dto';
import { PurchaseStatus } from '@prisma/client';
import { AdminGuard } from '@guards/admin.guard';

@ApiTags('admin/purchases')
@ApiBearerAuth('JWT-auth')
@UseGuards(AdminGuard)
@Controller('admin/purchases')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all purchases with optional filtering & pagination',
  })
  @ApiResponse({ status: 200, description: 'Returns a list of purchases' })
  async getAllPurchases(@Query() filterDto: FilterDto) {
    return this.purchaseService.getAllPurchases(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single purchase by ID' })
  async getPurchaseById(@Param('id') id: string) {
    return this.purchaseService.getPurchaseById(id);
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
    const { id, status } = params;
    return this.purchaseService.updateStatus({ id, status });
  }
}
