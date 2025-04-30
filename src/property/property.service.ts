import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { UpdatePropertyDto } from './dto/index.dto';
import { PaginatedResponse, PaginationQueryDto } from '@utils/pagination';
import { Property, PropertyStatus } from '@prisma/client';

@Injectable()
export class PropertyService {
  constructor(private readonly prisma: PrismaService) {}

  async createProperty(body): Promise<Property> {
    const { ownerId, ...propertyData } = body;

    // Create property
    const newProperty = await this.prisma.property.create({
      data: {
        ...propertyData,
        owner: { connect: { id: ownerId } },
      },
    });

    return newProperty;
  }
  async findAll(
    pagination: PaginationQueryDto,
    filters?: any,
  ): Promise<PaginatedResponse<Property>> {
    const { skip, take } = pagination;

    // Prepare the where clause with text search capabilities
    const where: any = {};

    if (filters) {
      if (filters.location) {
        where.location = { contains: filters.location, mode: 'insensitive' };
      }

      // Handle numeric ranges
      if (filters.minPrice || filters.maxPrice) {
        where.price = {};
        if (filters.minPrice) where.price.gte = parseFloat(filters.minPrice);
        if (filters.maxPrice) where.price.lte = parseFloat(filters.maxPrice);
      }

      // Handle exact matches for other fields that should remain exact
      if (filters.status) where.status = filters.status;
      if (filters.propertyType) where.propertyType = filters.propertyType;
    }
    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      data: properties,
      total,
      skip,
      take,
    };
  }

  async findOne(id: string): Promise<Property> {
    const property = await this.prisma.property.findUnique({
      where: { id },
    });
    if (!property) throw new NotFoundException('Property not found');
    return property;
  }

  async findAllByUser(
    userId: string,
    pagination: PaginationQueryDto,
  ): Promise<PaginatedResponse<Property>> {
    const { skip, take } = pagination;

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where: { ownerId: userId },
        skip,
        take,
      }),
      this.prisma.property.count({ where: { ownerId: userId } }),
    ]);

    return {
      data: properties,
      total,
      skip,
      take,
    };
  }

  async search(query: string): Promise<Property[]> {
    return await this.prisma.property.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { address: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
  }

  async updateProperty(id: string, dto: UpdatePropertyDto): Promise<Property> {
    await this.findOne(id);

    return await this.prisma.property.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async deleteProperty(id: string) {
    await this.findOne(id);
    return await this.prisma.property.delete({ where: { id } });
  }

  //update property status
  async updatePropertyStatus(
    id: string,
    status: PropertyStatus,
  ): Promise<Property> {
    await this.findOne(id);

    return await this.prisma.property.update({
      where: { id },
      data: { status },
    });
  }
}
