import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateRentalPaymentDto } from './dto/index.dto';

@Injectable()
export class RentalPaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async makePayment(dto: CreateRentalPaymentDto) {
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

    return {
      message: 'Rental Payment created successfully',
      data: payment,
    };
  }

  async getPaymentById(id: string) {
    const payment = await this.prisma.rentalPayment.findUnique({
      where: { id },
      include: { rentalAgreement: true },
    });

    if (!payment) {
      throw new NotFoundException('Rental Payment not found.');
    }

    return {
      message: 'Rental Payment fetched successfully',
      data: payment,
    };
  }

  async getUserPayments(userId: string) {
    const payments = await this.prisma.rentalPayment.findMany({
      where: {
        rentalAgreement: {
          OR: [{ landlordId: userId }, { tenantId: userId }],
        },
      },
      include: {
        rentalAgreement: {
          include: {
            listing: true, // Include listing details if needed
            landlord: { select: { id: true, firstname: true, lastname: true } },
            tenant: { select: { id: true, firstname: true, lastname: true } },
          },
        },
      },
    });

    return {
      message: 'User payments fetched successfully',
      data: payments,
    };
  }

  async getPropertyPayments(propertyId: string) {
    const payments = await this.prisma.rentalPayment.findMany({
      where: {
        rentalAgreement: {
          listing: {
            propertyId: propertyId,
          },
        },
      },
      include: {
        rentalAgreement: {
          include: {
            listing: {
              select: {
                property: {
                  select: {
                    title: true,
                  },
                },
              },
            },
            landlord: { select: { id: true, firstname: true, lastname: true } },
            tenant: { select: { id: true, firstname: true, lastname: true } },
          },
        },
      },
    });

    return {
      message: 'Payments for property rentals fetched successfully',
      data: payments,
    };
  }
}
