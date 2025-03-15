import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import {
  CreateListingDto,
  ListingFilterDto,
  UpdateListingDto,
} from './dto/index.dto';
import { ListingStatus } from '@prisma/client';

@Injectable()
export class ListingService {
  constructor(private readonly prisma: PrismaService) {}

  async createListing(body: CreateListingDto) {
    const { propertyId, listedById, ...listingData } = body;
    const listing = await this.prisma.listing.create({
      data: {
        ...listingData,
        property: {
          connect: { id: propertyId },
        },
        listedBy: {
          connect: { id: listedById },
        },
      },
      include: {
        property: true,
        listedBy: {
          select: {
            username: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
    });
    return {
      message: 'Listing created successfully',
      data: listing,
    };
  }

  async findAllListings(filters: ListingFilterDto) {
    const { propertyId, status, listingType, minPrice, maxPrice, location } =
      filters;

    const listings = await this.prisma.listing.findMany({
      where: {
        propertyId,
        status,
        listingType,
        price: {
          gte: minPrice, // Greater than or equal to
          lte: maxPrice, // Less than or equal to
        },
        property: {
          location: location
            ? { contains: location, mode: 'insensitive' }
            : undefined,
        },
      },
      include: {
        property: true,
        listedBy: {
          select: {
            username: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
    });
    return {
      message: 'Listings fetched successfully',
      data: listings,
    };
  }

  async findListingById(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: { property: true, listedBy: true },
    });

    if (!listing) {
      throw new NotFoundException(`Listing with ID ${id} not found`);
    }
    return {
      message: 'Listing fetched successfully',
      data: listing,
    };
  }

  async findListingsByUser(userId: string) {
    const listings = await this.prisma.listing.findMany({
      where: { listedById: userId },
      include: { property: true },
    });
    return {
      message: 'Listings fetched successfully',
      data: listings,
    };
  }

  async findListingsByProperty(propertyId: string) {
    const listings = await this.prisma.listing.findMany({
      where: { propertyId },
      include: { property: true },
    });
    return {
      message: 'Listings fetched successfully',
      data: listings,
    };
  }

  async updateListing(id: string, dto: UpdateListingDto) {
    await this.findListingById(id);
    const listing = await this.prisma.listing.update({
      where: { id },
      data: dto,
    });
    return {
      message: 'Listing updated successfully',
      data: listing,
    };
  }

  async deleteListing(id: string) {
    await this.prisma.listing.delete({
      where: { id },
    });
    return {
      message: 'Listing deleted successfully',
    };
  }

  //update listing status
  async updateListingStatus(id: string, status: ListingStatus) {
    await this.findListingById(id);
    const listing = await this.prisma.listing.update({
      where: { id },
      data: { status },
    });
    return {
      message: 'Listing status updated successfully',
      data: listing,
    };
  }
}
