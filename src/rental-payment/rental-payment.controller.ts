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
import {
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { CreateRentalPaymentDto } from './dto/index.dto';

@ApiTags('Rental Payment')
@ApiBearerAuth('JWT-auth')
@Controller('rental-payment')
export class RentalPaymentController {
  constructor(private readonly service: RentalPaymentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Make payment for a rental property' })
  @ApiBody({ type: CreateRentalPaymentDto })
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

  @Get('/property/:propertyID')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all rental payments for a specific property' })
  @ApiParam({ name: 'propertyID', description: 'Property ID' })
  async getPropertyPayments(@Param('propertyID') propertyId: string) {
    return this.service.getPropertyPayments(propertyId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'View rental payment details' })
  @ApiParam({
    name: 'id',
    description: 'Rental Payment ID',
  })
  async getPaymentById(@Param('id') id: string) {
    return this.service.getPaymentById(id);
  }

  @Get('status/:isPaid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all payments by status (paid or unpaid)' })
  @ApiParam({
    name: 'isPaid',
    description: 'Is the payment paid (true) or unpaid (false)',
    enum: ['true', 'false'],
  })
  async getPaymentsByStatus(@Param('isPaid') isPaid: string) {
    return this.service.getPaymentsByStatus(isPaid === 'true');
  }
}
