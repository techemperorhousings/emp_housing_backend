import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { PropertyBookingService } from './property-booking.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  AcceptBookingDto,
  CreatePropertyBookingDto,
  RejectBookingDto,
} from './dto/index.dto';

@ApiTags('Property Bookings')
@ApiBearerAuth('JWT-auth')
@Controller('bookings')
export class PropertyBookingController {
  constructor(private readonly service: PropertyBookingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new booking request (User Applies)' })
  @ApiBody({ type: CreatePropertyBookingDto })
  async createBooking(@Body() dto: CreatePropertyBookingDto) {
    return this.service.createBooking(dto);
  }

  @Get('user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all bookings for a user' })
  async getBookingsByUser(@Req() req) {
    return this.service.getBookingsByUser(req.user.id);
  }
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a booking by ID' })
  async getBookingById(@Param('id') id: string) {
    return this.service.getBookingById(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiParam({
    name: 'id',
    description: 'Booking ID',
    type: 'string',
    required: true,
  })
  async cancelBooking(@Param('id') id: string) {
    return this.service.cancelBooking(id);
  }

  @Get('property/:propertyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all bookings for a property' })
  async getBookingsByProperty(@Param('propertyId') propertyId: string) {
    return this.service.getBookingsByProperty(propertyId);
  }

  @Patch(':id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a booking request' })
  @ApiBody({
    description: 'Accept booking request payload',
    type: AcceptBookingDto,
    required: true,
  })
  async approveBookingRequest(
    @Param('id') id: string,
    @Body('responseMessage') responseMessage: string,
  ) {
    return this.service.approveBookingRequest(id, responseMessage);
  }

  @Patch(':id/deny')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deny a booking request' })
  @ApiBody({
    description: 'Deny booking request payload',
    type: RejectBookingDto,
    required: true,
  })
  async denyBookingRequest(
    @Param('id') id: string,
    @Body('responseMessage') responseMessage: string,
  ) {
    return this.service.denyBookingRequest(id, responseMessage);
  }
}
