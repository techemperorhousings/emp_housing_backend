import { PaginatedResponse } from '@utils/pagination';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreatePurchaseDto, FilterDto } from './dto/index.dto';
import { Purchase, PurchaseStatus } from '@prisma/client';

@Injectable()
export class PurchaseService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePurchaseDto): Promise<Purchase> {
    const { propertyId, buyerId, sellerId, purchaseDate } = dto;

    const listing = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });
    if (!listing) {
      throw new NotFoundException('Property not found');
    }

    if (!listing || listing.listingType !== 'FOR_SALE') {
      throw new NotFoundException('Listing not available for sale.');
    }

    return await this.prisma.purchase.create({
      data: {
        ...dto,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
        propertyId,
        buyerId,
        sellerId,
      },
      include: {
        property: true,
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
  }

  async getAllPurchases(
    filterDto: FilterDto,
  ): Promise<PaginatedResponse<Purchase>> {
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
            select: { id: true, name: true },
          },
        },
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

  //get purchase by id
  async getPurchaseById(purchaseId: string): Promise<Purchase> {
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
          select: { id: true, name: true },
        },
      },
    });
    if (!purchase) {
      throw new NotFoundException('Purchase record not found');
    }

    return purchase;
  }

  async findUserPurchases(userId: string): Promise<Purchase[]> {
    return await this.prisma.purchase.findMany({
      where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
      include: {
        property: true,
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
  }

  //update purchase status
  async updateStatus({
    id,
    status,
  }: {
    id: string;
    status: PurchaseStatus;
  }): Promise<Purchase> {
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
    // if (status === PurchaseStatus.COMPLETED) {
    //   await this.prisma.property.update({
    //     where: { id: purchase.propertyId },
    //     data: { ownerId: purchase.buyerId, status: PropertyStatus.SOLD },
    //   });
    // }

    return await this.prisma.purchase.update({
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
  }
}
