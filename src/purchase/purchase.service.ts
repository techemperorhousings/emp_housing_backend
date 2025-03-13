import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreatePurchaseDto } from './dto/index.dto';

@Injectable()
export class PurchaseService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePurchaseDto) {
    const {
      listingId,
      buyerId,
      sellerId,
      purchasePrice,
      purchaseDate,
      closingDate,
    } = dto;

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
        purchasePrice,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
        closingDate: closingDate ? new Date(closingDate) : null,
        listing: {
          connect: { id: listingId }, // Link purchase to the listing
        },
        property: {
          connect: { id: listing.propertyId }, // Link to the property's ID from listing
        },
        buyer: {
          connect: { id: buyerId },
        },
        seller: {
          connect: { id: sellerId },
        },
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

  async findByUser(userId: string) {
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

  async update({ id, status }) {
    const isPurchase = await this.prisma.purchase.findUnique({
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
    if (!isPurchase) throw new NotFoundException('Purchase not found');

    if (status === 'COMPLETED') {
      await this.prisma.property.update({
        where: { id: isPurchase.propertyId },
        data: { ownerId: isPurchase.buyerId },
      });
    }
    return {
      message: 'Purchase status updated successfully',
      data: isPurchase,
    };
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.purchase.delete({ where: { id } });
    return {
      message: 'Purchase deleted successfully',
    };
  }

  async filterByStatus(status) {
    const purchases = await this.prisma.purchase.findMany({
      where: { status },
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
}
