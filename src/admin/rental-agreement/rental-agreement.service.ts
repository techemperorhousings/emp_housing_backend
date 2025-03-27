import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class RentalAgreementService {
  constructor(private readonly prisma: PrismaService) {}
  async getAllRentals(pagination) {
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
      message: 'Rentals fetched successfully',
      data: agreements,
      total,
      skip,
      take,
    };
  }

  async getRentalById(id: string) {
    const rental = await this.prisma.rentalAgreement.findUnique({
      where: { id },
      include: this.includeObj,
    });

    if (!rental) throw new NotFoundException('Rental Agreement not found');

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
