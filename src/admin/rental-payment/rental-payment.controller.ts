import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { RentalPaymentService } from './rental-payment.service';
import {
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationQueryDto } from '@utils/pagination.dto';
import { AdminGuard } from '@guards/admin.guard';

@ApiTags('Admin Rental Payments')
@ApiBearerAuth('JWT-auth')
@UseGuards(AdminGuard)
@Controller('admin/rental-payments')
export class RentalPaymentController {
  constructor(private readonly service: RentalPaymentService) {}

  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  @ApiOkResponse({ description: 'List of all payments' })
  async getAllPayments(@Query() paginationDto: PaginationQueryDto) {
    return await this.service.getAllPayments(paginationDto);
  }

  @Get('/property/:id')
  @ApiOperation({
    summary: 'Get all payments for rentals under a specific property',
  })
  @ApiOkResponse({ description: 'List of payments related to a property' })
  async getPaymentsByProperty(
    @Param('id') propertyId: string,
    @Query() paginationDto: PaginationQueryDto,
  ) {
    return this.service.getPaymentsByProperty(propertyId, paginationDto);
  }

  @Get('/user/:id')
  @ApiOperation({ summary: 'Get all payments related to a specific user' })
  @ApiOkResponse({ description: 'List of payments related to the user' })
  async getPaymentsByUser(
    @Param('id') userId: string,
    @Query() paginationDto: PaginationQueryDto,
  ) {
    return this.service.getPaymentsByUser(userId, paginationDto);
  }
}
