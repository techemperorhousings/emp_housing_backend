import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { BookingFilterDto, CreatePropertyBookingDto } from './dto/index.dto';
import { BookingStatus, Prisma, PropertyBooking } from '@prisma/client';
import { PaginatedResponse } from '@utils/pagination';

@Injectable()
export class PropertyBookingService {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(dto: CreatePropertyBookingDto): Promise<PropertyBooking> {
    const checkInDate = new Date(dto.checkInDate);
    const checkoutDate = new Date(dto.checkoutDate);
    const today = new Date();
    // Ensure property exists and is available for booking
    const listing = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });

    if (!listing || listing.listingType !== 'FOR_RENT') {
      throw new NotFoundException('Listing not available for booking.');
    }

    // Ensure valid dates
    if (isNaN(checkInDate.getTime()) || isNaN(checkoutDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    // Check that check-in is not in the past
    if (checkInDate < today) {
      throw new BadRequestException('Check-in date cannot be in the past');
    }

    // Check that check-out is after check-in
    if (checkoutDate <= checkInDate) {
      throw new BadRequestException(
        'Check-out date must be after check-in date',
      );
    }

    // Check if the user already has an overlapping booking for this property
    const existingBooking = await this.prisma.propertyBooking.findFirst({
      where: {
        userId: dto.userId,
        propertyId: listing.id,
        OR: [
          {
            checkInDate: { lte: checkoutDate }, // Check-in is before or on the requested check-out date
            checkoutDate: { gte: checkInDate }, // Check-out is after or on the requested check-in date
          },
        ],
      },
    });

    if (existingBooking) {
      throw new ConflictException(
        'You already have a booking for this property during this period.',
      );
    }

    // Create a new booking
    return await this.prisma.propertyBooking.create({
      data: {
        ...dto,
        checkInDate,
        checkoutDate,
        propertyId: listing.id,
      },
    });
  }

  async getAllBookings(
    filterDto: BookingFilterDto,
  ): Promise<PaginatedResponse<PropertyBooking>> {
    const {
      skip,
      take,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      propertyId,
      userId,
      listingId,
    } = filterDto;

    // Build where condition for filtering

    const where: Prisma.PropertyBookingWhereInput = {
      ...(status && { status }),
      ...(propertyId && { propertyId }),
      ...(userId && { userId }),
      ...(listingId && { listingId }),
    };

    const [bookings, total] = await Promise.all([
      this.prisma.propertyBooking.findMany({
        where,
        skip,
        take,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          property: { select: { id: true, address: true } },
          user: {
            select: { id: true, firstname: true, lastname: true, email: true },
          },
        },
      }),
      this.prisma.propertyBooking.count({ where }),
    ]);

    return {
      data: bookings,
      total,
      take,
      skip,
    };
  }

  async getBookingById(id: string) {
    const booking = await this.prisma.propertyBooking.findUnique({
      where: { id },
      include: { property: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    return booking;
  }

  async getBookingsByUser(userId: string) {
    return await this.prisma.propertyBooking.findMany({
      where: { userId },
      include: { property: true },
    });
  }

  async getBookingsByProperty(propertyId: string) {
    return await this.prisma.propertyBooking.findMany({
      where: { propertyId },
    });
  }

  //cancel booking
  async cancelBooking(id: string) {
    // Find booking first to check if it exists and validate its status
    const booking = await this.getBookingById(id);

    // Check if booking status is pending
    if (booking.status !== 'PENDING') {
      throw new ForbiddenException(
        'Only bookings with pending status can be canceled',
      );
    }

    // Update the booking status to canceled
    return await this.prisma.propertyBooking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });
  }

  //approve a booking request
  async approveBookingRequest(id: string, responseMessage) {
    // Find booking first to check if it exists and validate its status
    const booking = await this.getBookingById(id);

    // Check if booking status is pending
    if (booking.status !== 'PENDING') {
      throw new ForbiddenException('Only pending bookings can be approved');
    }

    // Update the booking status to approved
    return await this.prisma.propertyBooking.update({
      where: { id },
      data: {
        status: 'APPROVED',
        responseMessage,
      },
    });
  }

  // deny a booking request
  async denyBookingRequest(id: string, responseMessage: string) {
    // Find booking first to check if it exists and validate its status
    const booking = await this.getBookingById(id);

    // Check if booking status is pending
    if (booking.status !== 'PENDING') {
      throw new ForbiddenException(
        'Only bookings with requested status can be denied',
      );
    }

    // Update the booking status to denied
    return await this.prisma.propertyBooking.update({
      where: { id },
      data: {
        status: 'REJECTED',
        responseMessage,
      },
    });
  }

  //change booking status
  async updateBookingStatus(
    id: string,
    status: BookingStatus,
    responseMessage?: string,
  ) {
    return await this.prisma.propertyBooking.update({
      where: { id },
      data: { status, responseMessage },
    });
  }
}
