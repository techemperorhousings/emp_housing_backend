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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreatePurchaseDto, UpdatePurchaseStatusDto } from './dto/index.dto';

@ApiTags('Purchases')
@ApiBearerAuth('JWT-auth')
@Controller('purchases')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new property purchase' })
  @HttpCode(HttpStatus.CREATED)
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
  async update(@Param() params: UpdatePurchaseStatusDto) {
    return this.purchaseService.update(params);
  }
}
