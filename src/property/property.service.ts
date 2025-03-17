import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import {
  CreatePropertyDto,
  FeatureDto,
  PropertyDocumentDto,
  PropertyImageDto,
  UpdatePropertyDto,
} from './dto/index.dto';
import { PaginationQueryDto } from '@utils/pagination.dto';

@Injectable()
export class PropertyService {
  constructor(private readonly prisma: PrismaService) {}

  async createProperty(body: CreatePropertyDto) {
    const { ownerId, features, images, documents, ...propertyData } = body;

    // Check if owner exists
    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
    });
    if (!owner) {
      throw new NotFoundException('User not found');
    }

    // Create property
    const newProperty = await this.prisma.property.create({
      data: {
        ...propertyData,
        owner: { connect: { id: ownerId } },
      },
    });

    // Create related data separately
    await this.createFeatures(newProperty.id, features);
    await this.createImages(newProperty.id, images);
    await this.createDocuments(newProperty.id, documents);

    return {
      message: 'Property created successfully',
      data: newProperty,
    };
  }

  async createFeatures(propertyId: string, features: FeatureDto[]) {
    if (!features?.length) return;
    const newFeatures = await this.prisma.feature.createMany({
      data: features.map((feature) => ({
        propertyId,
        name: feature.name,
        count: feature.count,
        description: feature.description,
      })),
    });
    return {
      message: 'Features created successfully',
      data: newFeatures,
    };
  }

  async createImages(propertyId: string, images: PropertyImageDto[]) {
    if (!images?.length) return;
    const new_images = await this.prisma.propertyImage.createMany({
      data: images.map((image) => ({
        propertyId,
        url: image.url,
        isFeatured: image.isFeatured,
      })),
    });
    return {
      message: 'Images created successfully',
      data: new_images,
    };
  }

  async createDocuments(propertyId: string, documents?: PropertyDocumentDto[]) {
    if (!documents?.length) return;
    const newDoc = await this.prisma.propertyDocument.createMany({
      data: documents.map((document) => ({
        propertyId,
        url: document.url,
        name: document.name,
      })),
    });
    return {
      message: 'Documents created successfully',
      data: newDoc,
    };
  }

  async findAll(pagination: PaginationQueryDto, filters?: any) {
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
        include: { features: true, images: true },
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      message: 'Properties fetched successfully',
      data: properties,
      total,
      skip,
      take,
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

  async findAllByUser(userId: string, pagination: PaginationQueryDto) {
    const { skip, take } = pagination;

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where: { ownerId: userId },
        include: { features: true, images: true },
        skip,
        take,
      }),
      this.prisma.property.count({ where: { ownerId: userId } }),
    ]);

    return {
      message: 'Properties fetched successfully',
      data: properties,
      total,
      skip,
      take,
    };
  }

  async search(query: string, pagination) {
    const { skip, take } = pagination;

    const [properties, total] = await Promise.all([
      this.prisma.property.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { location: { contains: query, mode: 'insensitive' } },
            { city: { contains: query, mode: 'insensitive' } },
            { state: { contains: query, mode: 'insensitive' } },
            { zipCode: { contains: query, mode: 'insensitive' } },
            { country: { contains: query, mode: 'insensitive' } },
            { address: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: { features: true, images: true },
      }),
      this.prisma.property.count(),
    ]);
    return {
      message: 'Properties fetched successfully',
      data: properties,
      total,
      skip,
      take,
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

  async deleteProperty(id: string) {
    await this.findOne(id);
    await this.prisma.property.delete({ where: { id } });
    return {
      message: 'Property deleted successfully',
    };
  }

  //remove property image
  async removeImage(propertyId: string, imageId: string) {
    const propertyImage = await this.prisma.propertyImage.findUnique({
      where: { id: imageId, propertyId },
    });
    if (!propertyImage) throw new NotFoundException('Property image not found');

    await this.prisma.propertyImage.delete({ where: { id: imageId } });
    return {
      message: 'Property image deleted successfully',
    };
  }

  //remove property document
  async removeDocument(propertyId: string, documentId: string) {
    const propertyDocument = await this.prisma.propertyDocument.findUnique({
      where: { id: documentId, propertyId },
    });
    if (!propertyDocument)
      throw new NotFoundException('Property document not found');

    await this.prisma.propertyDocument.delete({ where: { id: documentId } });
    return {
      message: 'Property document deleted successfully',
    };
  }

  //update property feature
  async updateFeature(
    propertyId: string,
    featureId: string,
    feature: FeatureDto,
  ) {
    const existingFeature = await this.prisma.feature.findUnique({
      where: { id: featureId, propertyId },
    });
    if (!existingFeature) throw new NotFoundException('Feature not found');

    const new_feature = await this.prisma.feature.update({
      where: { id: featureId },
      data: feature,
    });

    return {
      message: 'Feature updated successfully',
      data: new_feature,
    };
  }

  async deleteFeature(propertyId: string, featureId: string) {
    const existingFeature = await this.prisma.feature.findUnique({
      where: { id: featureId, propertyId },
    });
    if (!existingFeature) throw new NotFoundException('Feature not found');

    await this.prisma.feature.delete({ where: { id: featureId } });
    return {
      message: 'Feature deleted successfully',
    };
  }
}
