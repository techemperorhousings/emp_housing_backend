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
  Query,
} from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import {
  CreatePurchaseDto,
  FilterDto,
  UpdatePurchaseStatusDto,
} from './dto/index.dto';

@ApiTags('Purchases')
@ApiBearerAuth('JWT-auth')
@Controller('purchases')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new property purchase' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPurchaseDto: CreatePurchaseDto) {
    const purchase = await this.purchaseService.create(createPurchaseDto);
    return {
      message: 'Purchase created successfully',
      ...purchase,
    };
  }

  @Get('user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all purchases for a specific user' })
  async findByUser(@Req() req) {
    const purchases = await this.purchaseService.findUserPurchases(req.user.id);
    return {
      message: 'User purchases fetched successfully',
      ...purchases,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all purchases with optional filtering & pagination',
  })
  @ApiResponse({ status: 200, description: 'Returns a list of purchases' })
  async getAllPurchases(@Query() filterDto: FilterDto) {
    return this.purchaseService.getAllPurchases(filterDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a purchase details' })
  async findOne(@Param('id') id: string) {
    const purchases = await this.purchaseService.getPurchaseById(id);
    return {
      message: 'Purchase fetched successfully',
      ...purchases,
    };
  }

  @Patch(':id/status/:status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a purchase status' })
  async update(@Param() params: UpdatePurchaseStatusDto) {
    const purchase = this.purchaseService.updateStatus(params);
    return {
      message: 'Purchase status updated successfully',
      ...purchase,
    };
  }
}
