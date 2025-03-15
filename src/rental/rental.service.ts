import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateRentalAgreementDto } from './dto/index.dto';

@Injectable()
export class RentalService {
  constructor(private readonly prisma: PrismaService) {}

  async createRental(dto: CreateRentalAgreementDto) {
    const { listingId, tenantId, landlordId, ...data } = dto;

    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { property: true },
    });

    if (!listing || listing.listingType !== 'FOR_RENT') {
      throw new NotFoundException('Listing not available for rent.');
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
          connect: { id: landlordId }, // Connect to the tenant
        },
        ...data,
      },
    });
    return {
      message: 'Rental agreement created successfully',
      data: newAgreement,
    };
  }

  async getAllRentals() {
    const rentals = await this.prisma.rentalAgreement.findMany({
      include: {
        listing: true,
        tenant: {
          select: {
            firstname: true,
            lastname: true,
            email: true,
            phoneNumber: true,
          },
        },
        landlord: {
          select: {
            firstname: true,
            lastname: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });
    return {
      message: 'Rentals fetched successfully',
      data: rentals,
    };
  }

  async getRentalById(id: string) {
    const rental = await this.prisma.rentalAgreement.findUnique({
      where: { id },
      include: {
        listing: true,
        tenant: {
          select: {
            firstname: true,
            lastname: true,
            email: true,
            phoneNumber: true,
          },
        },
        landlord: {
          select: {
            firstname: true,
            lastname: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });

    if (!rental) throw new NotFoundException('Rental not found');
    return {
      message: 'Rental fetched successfully',
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
      include: {
        listing: true,
        tenant: {
          select: {
            firstname: true,
            lastname: true,
            email: true,
            phoneNumber: true,
          },
        },
        landlord: {
          select: {
            firstname: true,
            lastname: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });
    console.log(rentals);
    return {
      message: 'Rentals fetched successfully',
      data: rentals,
    };
  }

  async deleteRental(id: string) {
    await this.getRentalById(id);

    await this.prisma.rentalAgreement.delete({ where: { id } });
    return {
      message: 'Rental deleted successfully',
    };
  }
}
