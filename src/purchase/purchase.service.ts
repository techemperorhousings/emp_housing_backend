import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreatePurchaseDto } from './dto/index.dto';
import { PropertyStatus, PurchaseStatus } from '@prisma/client';

@Injectable()
export class PurchaseService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePurchaseDto) {
    const { listingId, buyerId, sellerId, purchaseDate } = dto;

    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { property: true },
    });
    if (!listing) {
      throw new NotFoundException('Property not found');
    }

    if (listing.listedById !== sellerId) {
      throw new BadRequestException('Seller does not own this property');
    }

    if (!listing || listing.listingType !== 'FOR_SALE') {
      throw new NotFoundException('Listing not available for sale.');
    }

    const purchase = await this.prisma.purchase.create({
      data: {
        ...dto,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
        listingId,
        propertyId: listing.propertyId,
        buyerId,
        sellerId,
      },
      include: {
        property: true,
        listing: true,
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
      message: 'Purchase created successfully',
      data: purchase,
    };
  }

  async findAll() {
    const purchases = await this.prisma.purchase.findMany({
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
    return {
      message: 'Purchases fetched successfully',
      data: purchases,
    };
  }

  async findOne(id: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
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
    if (!purchase) throw new NotFoundException('Purchase not found');
    return {
      message: 'Purchase fetched successfully',
      data: purchase,
    };
  }

  async findUserPurchases(userId: string) {
    const purchases = await this.prisma.purchase.findMany({
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
    return {
      message: 'Purchases fetched successfully',
      data: purchases,
    };
  }

  async update({ id, status }: { id: string; status: PurchaseStatus }) {
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
