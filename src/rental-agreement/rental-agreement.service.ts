import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RentalAgreement } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { PaginatedResponse } from '@utils/pagination';
import { CreateRentalAgreementDto } from './dto/index.dto';

@Injectable()
export class RentalAgreementService {
  constructor(private readonly prisma: PrismaService) {}
  async getAllRentalAgreements(
    pagination,
  ): Promise<PaginatedResponse<RentalAgreement>> {
    const { skip, take } = pagination;
    const [agreements, total] = await Promise.all([
      await this.prisma.rentalAgreement.findMany({
        skip,
        take,
        include: this.includeObj,
      }),
      await this.prisma.rentalAgreement.count(),
    ]);
    return {
      data: agreements,
      total,
      skip,
      take,
    };
  }

  async getRentalAgreementById(id: string): Promise<RentalAgreement> {
    const rental = await this.prisma.rentalAgreement.findUnique({
      where: { id },
      include: this.includeObj,
    });

    if (!rental) throw new NotFoundException('Rental Agreement not found');

    return rental;
  }

  async updateRentalStatus({ id, status }): Promise<RentalAgreement> {
    await this.getRentalAgreementById(id);

    return await this.prisma.rentalAgreement.update({
      where: { id },
      data: { status },
    });
  }

  async createRental(dto: CreateRentalAgreementDto): Promise<RentalAgreement> {
    const { propertyId, tenantId, bookingId, ...data } = dto;

    // Validate rental dates
    const { startDate, endDate } = this.validateRentalDates(
      dto.startDate,
      dto.endDate,
    );

    const listing = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!listing || listing.listingType !== 'FOR_RENT') {
      throw new NotFoundException('Listing not available for rent.');
    }

    //check if booking is available
    const booking = await this.prisma.propertyBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.status !== 'APPROVED') {
      throw new NotFoundException('Booking has not been approved.');
    }

    return await this.prisma.rentalAgreement.create({
      data: {
        property: {
          connect: { id: propertyId }, // Connect to the property
        },
        tenant: {
          connect: { id: tenantId }, // Connect to the tenant
        },
        landlord: {
          connect: { id: listing.ownerId }, // Connect to the landlord
        },
        booking: {
          connect: { id: bookingId }, // Connect to the booking
        },
        ...data,
        startDate,
        endDate,
      },
    });
  }

  //accept terms and conditions
  async acceptTermsAndConditions(id: string): Promise<RentalAgreement> {
    await this.getRentalAgreementById(id);

    return await this.prisma.rentalAgreement.update({
      where: { id },
      data: { termsAccepted: true },
    });
  }

  //get all user renatals
  async getUserRentalAgreements(userId: string): Promise<RentalAgreement[]> {
    return await this.prisma.rentalAgreement.findMany({
      where: {
        OR: [{ tenant: { id: userId } }, { landlord: { id: userId } }],
      },
      include: this.includeObj,
    });
  }

  //get rental agreements for a property
  async getPropertyRentalAgreements(
    propertyId: string,
  ): Promise<RentalAgreement[]> {
    return await this.prisma.rentalAgreement.findMany({
      where: {
        propertyId,
      },
      include: this.includeObj,
    });
  }

  //update rental agreement
  async updateRentalAgreement(id: string, dto): Promise<RentalAgreement> {
    const updateData: any = {};

    // Validate and update start and end dates if provided
    if (dto.startDate && dto.endDate) {
      const { startDate, endDate } = this.validateRentalDates(
        dto.startDate,
        dto.endDate,
      );
      updateData.startDate = startDate;
      updateData.endDate = endDate;
    }

    // Add other optional fields
    if (dto.amount !== undefined) updateData.amount = dto.amount;
    if (dto.depositAmount !== undefined)
      updateData.depositAmount = dto.depositAmount;

    // Perform the update
    return await this.prisma.rentalAgreement.update({
      where: { id },
      data: updateData,
    });
  }

  private validateRentalDates(startDateString: string, endDateString: string) {
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);
    const today = new Date();

    // Ensure valid dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    // Check that check-in is not in the past
    if (startDate < today) {
      throw new BadRequestException('Start date cannot be in the past');
    }

    // Check that check-out is after check-in
    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    return { startDate, endDate };
  }

  includeObj = {
    listing: {
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
          },
        },
      },
    },
    tenant: {
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
      },
    },
    landlord: {
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
      },
    },
    booking: {
      select: {
        id: true,
        checkInDate: true,
        checkoutDate: true,
        status: true,
      },
    },
  };
}
