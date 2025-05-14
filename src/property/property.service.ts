import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { UpdatePropertyDto } from './dto/index.dto';
import { PaginatedResponse, PaginationQueryDto } from '@utils/pagination';
import { Property, PropertyStatus, Report } from '@prisma/client';

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
  ): Promise<PaginatedResponse<Record<string, any>>> {
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
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              firstname: true,
              lastname: true,
            },
          },
        },
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
      include: {
        owner: {
          select: {
            firstname: true,
            lastname: true,
          },
        },
      },
    });
    if (!property) throw new NotFoundException('Property not found');
    return property;
  }

  async findAllByUser(
    userId: string,
    pagination: PaginationQueryDto,
  ): Promise<PaginatedResponse<Record<string, any>>> {
    const { skip, take } = pagination;

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where: { ownerId: userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              firstname: true,
              lastname: true,
            },
          },
        },
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

  //get related properties
  async getRelatedProperties(
    propertyId: string,
    pagination: PaginationQueryDto,
  ): Promise<PaginatedResponse<Record<string, any>>> {
    const { skip, take } = pagination;

    const property = await this.findOne(propertyId);

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where: {
          id: { not: propertyId },
          type: property.type,
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: {
              firstname: true,
              lastname: true,
            },
          },
        },
      }),
      this.prisma.property.count({
        where: {
          id: { not: propertyId },
          type: property.type,
        },
      }),
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
      include: {
        owner: {
          select: {
            firstname: true,
            lastname: true,
          },
        },
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

  async requestPropertyDeletion(
    id: string,
    reason?: string,
  ): Promise<Property> {
    const property = await this.findOne(id);
    if (property.deletionRequested)
      throw new BadRequestException('Deletion already requested');

    return await this.prisma.property.update({
      where: { id },
      data: {
        deletionRequested: true,
        deletionReason: reason,
      },
    });
  }

  async getPropertiesRequestingDeletion(): Promise<Property[]> {
    return this.prisma.property.findMany({
      where: { deletionRequested: true },
    });
  }

  async deleteProperty(id: string) {
    await this.findOne(id);
    return await this.prisma.property.delete({ where: { id } });
  }

  //cancel property deletion
  async cancelPropertyDeletion(id: string): Promise<Property> {
    await this.findOne(id);
    return await this.prisma.property.update({
      where: { id },
      data: {
        deletionRequested: false,
        deletionReason: null,
      },
    });
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
      include: {
        owner: {
          select: {
            firstname: true,
            lastname: true,
          },
        },
      },
    });
  }

  //report property
  async reportProperty(
    id: string,
    userId: string,
    reason: string,
  ): Promise<Report> {
    await this.findOne(id);

    return this.prisma.report.create({
      data: {
        reason,
        property: { connect: { id } },
        reportedBy: { connect: { id: userId } },
      },
    });
  }

  async getAllReports(): Promise<Record<string, any>[]> {
    return this.prisma.report.findMany({
      include: {
        property: true,
        reportedBy: {
          select: { id: true, email: true, firstname: true, lastname: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
