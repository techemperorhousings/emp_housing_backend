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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FilterDto, UpdatePurchaseStatusDto } from './dto/index.dto';
import { AdminGuard } from '@guards/admin.guard';

@ApiTags('Admin Purchase')
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
  async update(@Param() params: UpdatePurchaseStatusDto) {
    const { id, status } = params;
    return this.purchaseService.updateStatus({ id, status });
  }
}
