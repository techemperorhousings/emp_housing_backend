import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreatePropertyBookingDto } from './dto/index.dto';

@Injectable()
export class PropertyBookingService {
  constructor(private readonly prisma: PrismaService) {}

  async createBooking(dto: CreatePropertyBookingDto) {
    const checkInDate = new Date(dto.checkInDate);
    const checkoutDate = new Date(dto.checkoutDate);
    const today = new Date();
    // Ensure listing exists and is available for booking
    const listing = await this.prisma.listing.findUnique({
      where: { id: dto.listingId },
      include: { property: true },
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
        propertyId: listing.propertyId,
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
    const newBooking = await this.prisma.propertyBooking.create({
      data: {
        ...dto,
        checkInDate,
        checkoutDate,
        propertyId: listing.propertyId,
      },
    });

    return {
      message: 'Booking created successfully',
      data: newBooking,
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

    return {
      message: 'Booking fetched successfully',
      data: booking,
    };
  }

  async getBookingsByUser(userId: string) {
    const bookings = await this.prisma.propertyBooking.findMany({
      where: { userId },
      include: { property: true, listing: true },
    });
    return {
      message: 'User Bookings fetched successfully',
      data: bookings,
    };
  }

  async getBookingsByProperty(propertyId: string) {
    const bookings = await this.prisma.propertyBooking.findMany({
      where: { propertyId },
    });
    return {
      message: 'Property Bookings fetched successfully',
      data: bookings,
    };
  }

  //cancel booking
  async cancelBooking(id: string) {
    // Find booking first to check if it exists and validate its status
    const booking = await this.getBookingById(id);

    // Check if booking status is pending
    if (booking.data.status !== 'PENDING') {
      throw new ForbiddenException(
        'Only bookings with pending status can be canceled',
      );
    }

    // Update the booking status to canceled
    const updatedBooking = await this.prisma.propertyBooking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });

    return {
      message: 'Booking canceled successfully',
      data: updatedBooking,
    };
  }

  //approve a booking request
  async approveBookingRequest(id: string, responseMessage) {
    // Find booking first to check if it exists and validate its status
    const booking = await this.getBookingById(id);

    // Check if booking status is pending
    if (booking.data.status !== 'PENDING') {
      throw new ForbiddenException('Only pending bookings can be approved');
    }

    // Update the booking status to approved
    const updatedBooking = await this.prisma.propertyBooking.update({
      where: { id },
      data: {
        status: 'APPROVED',
        responseMessage,
      },
    });

    return {
      message: 'Booking approved successfully',
      data: updatedBooking,
    };
  }

  // deny a booking request
  async denyBookingRequest(id: string, responseMessage: string) {
    // Find booking first to check if it exists and validate its status
    const booking = await this.getBookingById(id);

    // Check if booking status is pending
    if (booking.data.status !== 'PENDING') {
      throw new ForbiddenException(
        'Only bookings with requested status can be denied',
      );
    }

    // Update the booking status to denied
    const updatedBooking = await this.prisma.propertyBooking.update({
      where: { id },
      data: {
        status: 'REJECTED',
        responseMessage,
      },
    });

    return {
      message: 'Booking denied successfully',
      data: updatedBooking,
    };
  }
}
