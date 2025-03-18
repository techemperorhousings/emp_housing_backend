import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateOfferDto } from './dto/index.dto';
import { OfferStatus } from '@prisma/client';

@Injectable()
export class OfferService {
  constructor(private readonly prisma: PrismaService) {}

  async createOffer(dto: CreateOfferDto) {
    // Ensure buyer and listing exists
    const [buyer, listing] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: dto.buyerId },
      }),
      this.prisma.listing.findUnique({
        where: { id: dto.listingId },
      }),
    ]);

    if (!buyer) throw new NotFoundException('Buyer not found');

    if (!listing) throw new NotFoundException('Listing not found');

    const offer = await this.prisma.offer.create({
      data: dto,
    });
    return {
      message: 'Offer created successfully',
      data: offer,
    };
  }

  async getOfferById(id: string) {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
      include: { buyer: true, listing: true },
    });

    if (!offer) throw new NotFoundException('Offer not found');

    return {
      message: 'Offer fetched successfully',
      data: offer,
    };
  }

  async getOffersByListing(listingId: string) {
    const offers = await this.prisma.offer.findMany({
      where: { listingId },
      include: { buyer: true },
    });
    return {
      message: 'Offers fetched successfully',
      data: offers,
    };
  }

  async getuserOffers(buyerId: string) {
    const offers = await this.prisma.offer.findMany({
      where: { buyerId },
      include: { listing: true },
    });
    return {
      message: 'Offers fetched successfully',
      data: offers,
    };
  }

  //updateOfferStatus
  async updateOfferStatus(id: string, status: OfferStatus) {
    await this.getOfferById(id);
    const updatedOffer = await this.prisma.offer.update({
      where: { id },
      data: { status },
    });
    return {
      message: 'Offer status updated successfully',
      data: updatedOffer,
    };
  }

  async withdrawOffer({ id, userId }) {
    await this.getOfferById(id);
    const offer = await this.getOfferById(id);
    //only update if status is pending and user is user
    if (offer.data.status !== OfferStatus.PENDING)
      throw new ForbiddenException(
        'Cannot update offer status if offer is not pending',
      );

    if (offer.data.buyerId !== userId) {
      throw new ForbiddenException('Cannot cancel offer');
    }
    const updatedOffer = await this.prisma.offer.update({
      where: { id },
      data: {
        status: OfferStatus.WITHDRAWN,
      },
    });
    return {
      message: 'Offer canceled successfully',
      data: updatedOffer,
    };
  }
}
