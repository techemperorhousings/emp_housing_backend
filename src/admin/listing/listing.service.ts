import { ListingFilterDto, UpdateListingDto } from '@listing/dto/index.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ListingStatus } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { PaginationQueryDto } from '@utils/pagination.dto';

@Injectable()
export class ListingService {
  constructor(private readonly prisma: PrismaService) {}
  async findAllListings(filters: ListingFilterDto) {
    const { status, listingType, minPrice, maxPrice, location } = filters;

    const { skip, take } = filters;
    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where: {
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
        skip,
        take,
      }),
      this.prisma.listing.count({
        where: {
          status,
          listingType,
          price: {
            gte: minPrice,
            lte: maxPrice,
          },
          property: {
            location: location
              ? { contains: location, mode: 'insensitive' }
              : undefined,
          },
        },
      }),
    ]);
    return {
      message: 'Listings fetched successfully',
      data: listings,
      total,
      skip,
      take,
    };
  }

  async findListingById(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: { property: true, listedBy: true },
    });

    if (!listing) {
      throw new NotFoundException(`Listing not found`);
    }
    return {
      message: 'Listing fetched successfully',
      data: listing,
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

  async findListingsByProperty(
    propertyId: string,
    pagination: PaginationQueryDto,
  ) {
    const { skip, take } = pagination;

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where: { propertyId },
        include: { property: true },
        skip,
        take,
      }),
      this.prisma.listing.count({
        where: { propertyId },
      }),
    ]);

    return {
      message: 'Listings fetched successfully',
      data: listings,
      total,
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
