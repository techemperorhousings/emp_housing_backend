import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
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
  BookingFilterDto,
  CreatePropertyBookingDto,
  RejectBookingDto,
  UpdateBookingStatusDto,
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
    const booking = await this.service.createBooking(dto);
    return {
      message: 'Booking request created successfully',
      ...booking,
    };
  }

  @Get('user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all bookings for a user' })
  async getBookingsByUser(@Req() req) {
    const bookings = await this.service.getBookingsByUser(req.user.id);
    return {
      message: 'User bookings fetched successfully',
      ...bookings,
    };
  }

  @Get('property/:propertyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all bookings for a property' })
  async getBookingsByProperty(@Param('propertyId') propertyId: string) {
    const bookings = await this.service.getBookingsByProperty(propertyId);
    return {
      message: 'Property bookings fetched successfully',
      ...bookings,
    };
  }

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
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a booking by ID' })
  async getBookingById(@Param('id') id: string) {
    const booking = await this.service.getBookingById(id);
    return {
      message: 'Booking fetched successfully',
      ...booking,
    };
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
    const booking = await this.service.approveBookingRequest(
      id,
      responseMessage,
    );
    return {
      message: 'Booking request approved successfully',
      ...booking,
    };
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
    const booking = await this.service.denyBookingRequest(id, responseMessage);
    return {
      message: 'Booking request denied successfully',
      ...booking,
    };
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
    const booking = await this.service.cancelBooking(id);
    return {
      message: 'Booking cancelled successfully',
      ...booking,
    };
  }
}
