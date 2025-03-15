import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreatePropertyDto, UpdatePropertyDto } from './dto/index.dto';

@Injectable()
export class PropertyService {
  constructor(private readonly prisma: PrismaService) {}

  async createProperty(body: CreatePropertyDto) {
    const { ownerId, ...propertyData } = body;
    // check if owner exists
    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
    });
    if (!owner) {
      throw new NotFoundException('User not found');
    }

    // create property with owner, features, images and documents
    // include property to fetch features, images and documents in the response
    const newProperty = await this.prisma.property.create({
      data: {
        ...propertyData,
        owner: {
          connect: { id: ownerId }, // Connect to existing owner
        },
        features: {
          create:
            body.features?.map((feature) => ({
              name: feature.name,
              count: feature.count,
              description: feature.description,
            })) || [],
        },
        images: {
          create:
            body.images?.map((image) => ({
              url: image.url,
              isFeatured: image.isFeatured,
            })) || [],
        },
        documents: {
          create:
            body.documents?.map((document) => ({
              url: document.url,
              name: document.name,
            })) || [],
        },
      },
      include: { features: true, images: true },
    });

    return {
      message: 'Property created successfully',
      newProperty,
    };
  }

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
      properties,
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

  async findAllByUser(userId: string) {
    const properties = await this.prisma.property.findMany({
      where: { ownerId: userId },
      include: { features: true, images: true },
    });
    return {
      message: 'Properties fetched successfully',
      data: properties,
    };
  }

  async search(query: string) {
    const properties = await this.prisma.property.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
          { state: { contains: query, mode: 'insensitive' } },
          { zipCode: { contains: query, mode: 'insensitive' } },
          { country: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { features: true, images: true },
    });
    return {
      message: 'Properties fetched successfully',
      properties,
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
      property,
    };
  }

  async deleteProperty(id: string) {
    await this.findOne(id);
    await this.prisma.property.delete({ where: { id } });
    return {
      message: 'Property deleted successfully',
    };
  }
}
