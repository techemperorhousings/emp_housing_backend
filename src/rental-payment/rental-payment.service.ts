import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateRentalPaymentDto } from './dto/index.dto';
import { PaginatedResponse, PaginationQueryDto } from '@utils/pagination';
import { RentalPayment } from '@prisma/client';

@Injectable()
export class RentalPaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async makePayment(dto: CreateRentalPaymentDto): Promise<RentalPayment> {
    // Ensure the rental agreement exists
    const rentalAgreement = await this.prisma.rentalAgreement.findUnique({
      where: { id: dto.rentalAgreementId },
    });

    if (!rentalAgreement) {
      throw new NotFoundException('Rental Agreement not found.');
    }

    const payment = await this.prisma.rentalPayment.create({
      data: {
        ...dto,
        paymentDate: new Date(dto.paymentDate),
        dueDate: new Date(dto.dueDate),
        rentalAgreementId: dto.rentalAgreementId,
      },
    });

    //updates the isPaid field on the rental agreement
    await this.prisma.rentalAgreement.update({
      where: { id: dto.rentalAgreementId },
      data: { isPaid: true },
    });

    return payment;
  }

  async getAllPayments(
    paginationDto: PaginationQueryDto,
  ): Promise<PaginatedResponse<RentalPayment>> {
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
      data: payments,
      take,
      skip,
      total,
    };
  }

  async getPaymentById(id: string): Promise<RentalPayment> {
    const payment = await this.prisma.rentalPayment.findUnique({
      where: { id },
      include: { rentalAgreement: true },
    });

    if (!payment) {
      throw new NotFoundException('Rental Payment not found.');
    }

    return payment;
  }

  async getUserPayments(userId: string): Promise<RentalPayment[]> {
    return await this.prisma.rentalPayment.findMany({
      where: {
        rentalAgreement: {
          OR: [{ landlordId: userId }, { tenantId: userId }],
        },
      },
      include: {
        rentalAgreement: {
          include: {
            listing: true, // Include listing details if needed
            landlord: { select: { id: true, fullname: true } },
            tenant: { select: { id: true, fullname: true } },
          },
        },
      },
    });
  }

  async getPropertyPayments(propertyId: string): Promise<RentalPayment[]> {
    return await this.prisma.rentalPayment.findMany({
      where: {
        rentalAgreement: {
          listing: {
            propertyId: propertyId,
          },
        },
      },
      include: this.includeObj,
    });
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
            property: { select: { name: true } },
          },
        },
      },
    },
  };
}
