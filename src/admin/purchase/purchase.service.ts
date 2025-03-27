import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { FilterDto } from './dto/index.dto';
import { PurchaseStatus, PropertyStatus } from '@prisma/client';

@Injectable()
export class PurchaseService {
  constructor(private readonly prisma: PrismaService) {}
  async getAllPurchases(filterDto: FilterDto) {
    const { skip, take, status } = filterDto;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [payments, total] = await Promise.all([
      this.prisma.purchase.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: {
            select: { id: true, firstname: true, lastname: true },
          },
          seller: {
            select: { id: true, firstname: true, lastname: true },
          },
          property: {
            select: { id: true, title: true },
          },
        },
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

  //get purchase by id
  async getPurchaseById(purchaseId: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        buyer: {
          select: { id: true, firstname: true, lastname: true },
        },
        seller: {
          select: { id: true, firstname: true, lastname: true },
        },
        property: {
          select: { id: true, title: true },
        },
      },
    });
    if (!purchase) {
      throw new NotFoundException('Purchase record not found');
    }

    return { message: 'Purchase fetched successfully', data: purchase };
  }

  //update purchase status
  async updateStatus({ id, status }: { id: string; status: PurchaseStatus }) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      include: {
        property: true,
      },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    // Update the property owner if purchase is completed
    if (status === PurchaseStatus.COMPLETED) {
      await this.prisma.property.update({
        where: { id: purchase.propertyId },
        data: { ownerId: purchase.buyerId, status: PropertyStatus.SOLD },
      });
    }

    const updated_purchase = await this.prisma.purchase.update({
      where: { id },
      data: { status },
      include: {
        buyer: {
          select: {
            firstname: true,
            lastname: true,
            email: true,
          },
        },
        seller: {
          select: {
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
    });

    return {
      message: 'Purchase status updated successfully',
      data: updated_purchase,
    };
  }
}
