import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import {
  CreateListingDto,
  ListingFilterDto,
  UpdateListingDto,
} from './dto/index.dto';
import { PaginatedResponse, PaginationQueryDto } from '@utils/pagination';
import { Listing } from '@prisma/client';

@Injectable()
export class ListingService {
  constructor(private readonly prisma: PrismaService) {}

  async createListing(body: CreateListingDto): Promise<Listing> {
    const { propertyId, listedById, ...listingData } = body;

    //check if property nd user exists
    const [property, listedBy] = await Promise.all([
      this.prisma.property.findUnique({
        where: { id: propertyId },
      }),
      this.prisma.user.findUnique({
        where: { id: listedById },
      }),
    ]);

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (!listedBy) {
      throw new NotFoundException('User not found');
    }

    return await this.prisma.listing.create({
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
  }

  async findAllListings(
    filters: ListingFilterDto,
  ): Promise<PaginatedResponse<Listing>> {
    const { status, listingType, minPrice, maxPrice, location, skip, take } =
      filters;

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where: {
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
        skip,
        take,
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
      data: listings,
      total,
      skip,
      take,
    };
  }

  async findListingById(id: string): Promise<Listing> {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: { property: true, listedBy: true },
    });

    if (!listing) {
      throw new NotFoundException(`Listing not found`);
    }
    return listing;
  }

  async findListingsByUser(
    userId: string,
    pagination: PaginationQueryDto,
  ): Promise<PaginatedResponse<Listing>> {
    const { skip, take } = pagination;
    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where: { listedById: userId },
        include: { property: true },
        skip,
        take,
      }),
      this.prisma.listing.count({
        where: { listedById: userId },
      }),
    ]);

    return {
      data: listings,
      total,
      skip,
      take,
    };
  }

  async findListingsByProperty(
    propertyId: string,
    pagination: PaginationQueryDto,
  ): Promise<PaginatedResponse<Listing>> {
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
      data: listings,
      total,
      skip,
      take,
    };
  }
  async updateListing(id: string, dto: UpdateListingDto): Promise<Listing> {
    await this.findListingById(id);
    const listing = await this.prisma.listing.update({
      where: { id },
      data: dto,
    });
    return listing;
  }

  async deleteListing(id: string) {
    return await this.prisma.listing.delete({
      where: { id },
    });
  }

  //update listing status
  async updateListingStatus(id: string, isActive: boolean): Promise<Listing> {
    await this.findListingById(id);
    const listing = await this.prisma.listing.update({
      where: { id },
      data: { isActive },
    });
    return listing;
  }
}
