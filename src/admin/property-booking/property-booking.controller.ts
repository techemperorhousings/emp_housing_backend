import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PropertyBookingService } from './property-booking.service';
import { AdminGuard } from '@guards/admin.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BookingFilterDto, UpdateBookingStatusDto } from './dto/index.dto';

@ApiTags('Admin Property Bookings')
@ApiBearerAuth('JWT-auth')
@UseGuards(AdminGuard)
@Controller('admin/bookings')
export class PropertyBookingController {
  constructor(private readonly service: PropertyBookingService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retrieve all bookings with optional filters',
    description:
      'Fetch all bookings with pagination, sorting, and filtering options.',
  })
  async getAllBookings(@Query() filterDto: BookingFilterDto) {
    return await this.service.getAllBookings(filterDto);
  }

  @Patch(':id/status/')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update the status of a booking' })
  async updateBookingStatus(
    @Param('id') id: string,
    @Body() updateBookingStatusDto: UpdateBookingStatusDto,
  ) {
    const { status, responseMessage } = updateBookingStatusDto;
    return this.service.updateBookingStatus(id, status, responseMessage);
  }
}
