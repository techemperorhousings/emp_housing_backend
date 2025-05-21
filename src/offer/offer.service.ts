import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateOfferDto, FilterDto } from './dto/index.dto';
import { Offer, OfferStatus } from '@prisma/client';
import { PaginatedResponse } from '@utils/pagination';

@Injectable()
export class OfferService {
  constructor(private readonly prisma: PrismaService) {}

  async createOffer(dto: CreateOfferDto): Promise<Offer> {
    // Ensure buyer and listing exists
    const [buyer, listing] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: dto.buyerId },
      }),
      this.prisma.property.findUnique({
        where: { id: dto.propertyId },
      }),
    ]);

    if (!buyer) throw new NotFoundException('Buyer not found');

    if (!listing) throw new NotFoundException('Listing not found');

    return await this.prisma.offer.create({
      data: dto,
    });
  }

  //get all offers
  async getAllOffers(data: FilterDto): Promise<PaginatedResponse<Offer>> {
    const { skip, take, status } = data;

    const [offers, total] = await Promise.all([
      this.prisma.offer.findMany({
        skip,
        take,
        where: status ? { status } : {},
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.offer.count(),
    ]);
    return {
      data: offers,
      total,
      skip,
      take,
    };
  }

  async getOfferById(id: string): Promise<Offer> {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
      include: { buyer: true, property: true },
    });

    if (!offer) throw new NotFoundException('Offer not found');

    return offer;
  }

  async getOffersByListing(propertyId: string): Promise<Offer[]> {
    return await this.prisma.offer.findMany({
      where: { propertyId },
      include: { buyer: true },
    });
  }

  async getuserOffers(buyerId: string): Promise<Offer[]> {
    return await this.prisma.offer.findMany({
      where: { buyerId },
      include: { property: true },
    });
  }

  //updateOfferStatus
  async updateOfferStatus(id: string, status: OfferStatus): Promise<Offer> {
    await this.getOfferById(id);
    return await this.prisma.offer.update({
      where: { id },
      data: { status },
    });
  }

  async withdrawOffer({ id, userId }) {
    await this.getOfferById(id);
    const offer = await this.getOfferById(id);
    //only update if status is pending and user is user
    if (offer.status !== OfferStatus.PENDING)
      throw new ForbiddenException(
        'Cannot update offer status if offer is not pending',
      );

    if (offer.buyerId !== userId) {
      throw new ForbiddenException('Cannot cancel offer');
    }
    return await this.prisma.offer.update({
      where: { id },
      data: {
        status: OfferStatus.WITHDRAWN,
      },
    });
  }
}
