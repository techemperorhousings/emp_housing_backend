import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyStatus } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { UpdatePropertyDto } from '@property/dto/index.dto';

@Injectable()
export class PropertyService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: any) {
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

    const properties = await this.prisma.property.findMany({
      where,
      include: { features: true, images: true },
    });

    return {
      message: 'Properties fetched successfully',
      data: properties,
    };
  }

  async updateProperty(id: string, dto: UpdatePropertyDto) {
    await this.findOne(id);

    const property = await this.prisma.property.update({
      where: { id },
      data: {
        ...dto,
        features: dto.features
          ? {
              deleteMany: {}, // Delete only if new features are provided
              create: dto.features.map((feature) => ({
                name: feature.name,
                count: feature.count,
                description: feature.description,
              })),
            }
          : undefined, // Don't modify existing features if not provided

        images: dto.images
          ? {
              deleteMany: {}, // Delete only if new images are provided
              create: dto.images.map((image) => ({
                url: image.url,
                isFeatured: image.isFeatured,
              })),
            }
          : undefined,

        documents: dto.documents
          ? {
              deleteMany: {},
              create: dto.documents.map((document) => ({
                url: document.url,
                name: document.name,
              })),
            }
          : undefined,
      },
      include: { features: true, images: true, documents: true }, // Ensure documents are included in response
    });

    return {
      message: 'Property updated successfully',
      data: property,
    };
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: { features: true, images: true },
    });
    if (!property) throw new NotFoundException('Property not found');
    return {
      message: 'Property fetched successfully',
      data: property,
    };
  }

  async deleteProperty(id: string) {
    await this.findOne(id);
    await this.prisma.property.delete({ where: { id } });
    return {
      message: 'Property deleted successfully',
    };
  }

  //update property status
  async updatePropertyStatus(id: string, status: PropertyStatus) {
    await this.findOne(id);

    const property = await this.prisma.property.update({
      where: { id },
      data: { status },
    });

    return {
      message: 'Property status updated successfully',
      data: property,
    };
  }
}
