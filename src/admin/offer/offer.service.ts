import { Injectable, NotFoundException } from '@nestjs/common';
import { FilterDto } from './dto/index.dto';
import { PrismaService } from '@prisma/prisma.service';
import { OfferStatus } from '@prisma/client';

@Injectable()
export class OfferService {
  constructor(private readonly prisma: PrismaService) {}
  //get all offers
  async getAllOffers(data: FilterDto) {
    const { skip, take, status } = data;

    const offers = await this.prisma.offer.findMany({
      skip,
      take,
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
    });
    return {
      message: 'Offers fetched successfully',
      data: offers,
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
}
