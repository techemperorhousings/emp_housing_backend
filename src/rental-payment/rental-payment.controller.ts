import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { RentalPaymentService } from './rental-payment.service';
import { ApiOperation, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateRentalPaymentDto } from './dto/index.dto';

@ApiTags('Rental Payment')
@ApiBearerAuth('JWT-auth')
@Controller('rental-payment')
export class RentalPaymentController {
  constructor(private readonly service: RentalPaymentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Make payment for a rental property' })
  async createPayment(@Body() dto: CreateRentalPaymentDto) {
    return this.service.makePayment(dto);
  }

  @Get('user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all user rental payments',
  })
  async getPaymentsByRentalAgreement(@Req() req) {
    return this.service.getUserPayments(req.user.id);
  }

  @Get('/property/:propertyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all rental payments for a specific property' })
  async getPropertyPayments(@Param('propertyId') propertyId: string) {
    return this.service.getPropertyPayments(propertyId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'View rental payment details' })
  async getPaymentById(@Param('id') id: string) {
    return this.service.getPaymentById(id);
  }
}
