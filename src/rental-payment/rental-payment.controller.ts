import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { RentalPaymentService } from './rental-payment.service';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';
import { CreateRentalPaymentDto } from './dto/index.dto';
import { PaginationQueryDto } from '@utils/pagination';

@ApiTags('Rental Payment')
@ApiBearerAuth('JWT-auth')
@Controller('rental-payment')
export class RentalPaymentController {
  constructor(private readonly service: RentalPaymentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Make payment for a rental property' })
  async createPayment(@Body() dto: CreateRentalPaymentDto) {
    const payment = await this.service.makePayment(dto);
    return {
      message: 'Payment made successfully',
      ...payment,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  @ApiOkResponse({ description: 'List of all payments' })
  async getAllPayments(@Query() paginationDto: PaginationQueryDto) {
    const payments = await this.service.getAllPayments(paginationDto);
    return {
      message: 'Payments fetched successfully',
      ...payments,
    };
  }

  @Get('user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all user rental payments',
  })
  async getPaymentsByRentalAgreement(@Req() req) {
    const payments = await this.service.getUserPayments(req.user.id);
    return {
      message: 'User payments fetched successfully',
      ...payments,
    };
  }

  @Get('/property/:propertyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all rental payments for a specific property' })
  async getPropertyPayments(@Param('propertyId') propertyId: string) {
    const payments = await this.service.getPropertyPayments(propertyId);
    return {
      message: 'Property payments fetched successfully',
      ...payments,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'View rental payment details' })
  async getPaymentById(@Param('id') id: string) {
    const payments = await this.service.getPaymentById(id);
    return {
      message: 'Payment fetched successfully',
      ...payments,
    };
  }
}
