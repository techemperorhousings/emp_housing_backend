import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { PaginationQueryDto } from '@utils/pagination.dto';

@Injectable()
export class RentalPaymentService {
  constructor(private readonly prisma: PrismaService) {}
  async getAllPayments(paginationDto: PaginationQueryDto) {
    const { skip, take } = paginationDto;

    const [payments, total] = await Promise.all([
      this.prisma.rentalPayment.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: this.includeObj,
      }),
      this.prisma.rentalPayment.count(),
    ]);

    return {
      message: 'Payments fetched successfully',
      data: payments,
      take,
      skip,
      total,
    };
  }

  async getPaymentsByProperty(
    propertyId: string,
    paginationDto: PaginationQueryDto,
  ) {
    const { skip, take } = paginationDto;

    const [payments, total] = await Promise.all([
      this.prisma.rentalPayment.findMany({
        where: { rentalAgreement: { listing: { propertyId } } },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: this.includeObj,
      }),
      this.prisma.rentalPayment.count({
        where: { rentalAgreement: { listing: { propertyId } } },
      }),
    ]);

    return {
      message: `Payments for property  fetched successfully`,
      data: payments,
      take,
      skip,
      total,
    };
  }

  async getPaymentsByUser(userId: string, paginationDto: PaginationQueryDto) {
    const { skip, take } = paginationDto;

    const [payments, total] = await Promise.all([
      this.prisma.rentalPayment.findMany({
        where: {
          rentalAgreement: {
            OR: [{ landlordId: userId }, { tenantId: userId }],
          },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: this.includeObj,
      }),
      this.prisma.rentalPayment.count({
        where: {
          rentalAgreement: {
            OR: [{ landlordId: userId }, { tenantId: userId }],
          },
        },
      }),
    ]);

    return {
      message: `Payments for user ${userId} fetched successfully`,
      data: payments,
      take,
      skip,
      total,
    };
  }

  includeObj = {
    rentalAgreement: {
      include: {
        tenant: { select: { id: true, firstname: true, lastname: true } },
        landlord: {
          select: { id: true, firstname: true, lastname: true },
        },
        listing: {
          select: {
            property: { select: { title: true } },
          },
        },
      },
    },
  };
}
