import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateRentalAgreementDto } from './dto/index.dto';

@Injectable()
export class RentalAgreementService {
  constructor(private readonly prisma: PrismaService) {}

  async createRental(dto: CreateRentalAgreementDto) {
    const { listingId, tenantId, bookingId, ...data } = dto;

    // Validate rental dates
    const { startDate, endDate } = this.validateRentalDates(
      dto.startDate,
      dto.endDate,
    );

    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { property: true },
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

    const newAgreement = await this.prisma.rentalAgreement.create({
      data: {
        listing: {
          connect: { id: listingId }, // Connect to the listing
        },
        tenant: {
          connect: { id: tenantId }, // Connect to the tenant
        },
        landlord: {
          connect: { id: listing.listedById }, // Connect to the tenant
        },
        booking: {
          connect: { id: bookingId }, // Connect to the booking
        },
        ...data,
        startDate,
        endDate,
      },
    });
    return {
      message: 'Rental agreement created successfully',
      data: newAgreement,
    };
  }

  async getRentalById(id: string) {
    const rental = await this.prisma.rentalAgreement.findUnique({
      where: { id },
      include: this.includeObj,
    });

    if (!rental) throw new NotFoundException('Rental not found');
    return {
      message: 'Rental agreement fetched successfully',
      data: rental,
    };
  }

  //accept terms and conditions
  async acceptTermsAndConditions(id: string) {
    await this.getRentalById(id);

    const rental = await this.prisma.rentalAgreement.update({
      where: { id },
      data: { termsAccepted: true },
    });
    return {
      message: 'Terms and conditions accepted successfully',
      data: rental,
    };
  }

  async updateRentalStatus({ id, status }) {
    await this.getRentalById(id);

    const rental = await this.prisma.rentalAgreement.update({
      where: { id },
      data: { status },
    });
    return {
      message: 'Rental status updated successfully',
      data: rental,
    };
  }

  //get all user renatals
  async getUserRentals(userId: string) {
    const rentals = await this.prisma.rentalAgreement.findMany({
      where: {
        OR: [{ tenant: { id: userId } }, { landlord: { id: userId } }],
      },
      include: this.includeObj,
    });
    return {
      message: 'Rentals fetched successfully',
      data: rentals,
    };
  }

  //get rental agreements for a property
  async getPropertyRentalAgreements(propertyId: string) {
    const rentals = await this.prisma.rentalAgreement.findMany({
      where: {
        listing: {
          propertyId: propertyId,
        },
      },
      include: this.includeObj,
    });

    return {
      message: 'Rental agreements fetched successfully',
      data: rentals,
    };
  }

  //update rental agreement
  async updateRentalAgreement(id: string, dto) {
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
    const agreement = await this.prisma.rentalAgreement.update({
      where: { id },
      data: updateData,
    });
    return {
      message: 'Rental agreement updated successfully',
      data: agreement,
    };
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
