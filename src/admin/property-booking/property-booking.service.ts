import { Injectable } from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { BookingFilterDto } from './dto/index.dto';

@Injectable()
export class PropertyBookingService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllBookings(filterDto: BookingFilterDto) {
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
      message: 'Bookings fetched successfully',
      data: bookings,
      total,
      take,
      skip,
    };
  }

  //change booking status
  async updateBookingStatus(
    id: string,
    status: BookingStatus,
    responseMessage?: string,
  ) {
    const booking = await this.prisma.propertyBooking.update({
      where: { id },
      data: { status, responseMessage },
    });

    return {
      message: 'Booking status updated successfully',
      data: booking,
    };
  }
}
