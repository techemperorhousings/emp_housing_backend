import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/index.dto';

@Injectable()
export class PropertyDocumentService {
  constructor(private readonly prisma: PrismaService) {}

  async createDocument(dto: CreateDocumentDto) {
    // Ensure property exists before adding a document
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const newDocument = await this.prisma.propertyDocument.create({
      data: dto,
    });

    return {
      message: 'Document created successfully',
      data: newDocument,
    };
  }

  async getDocumentsByProperty(propertyId: string) {
    const documents = await this.prisma.propertyDocument.findMany({
      where: { propertyId },
    });
    return {
      message: 'Documents fetched successfully',
      data: documents,
    };
  }

  async updateDocument(id: string, dto: UpdateDocumentDto) {
    // Ensure document exists
    await this.getDocumentById(id);

    const documents = await this.prisma.propertyDocument.update({
      where: { id },
      data: dto,
    });
    return {
      message: 'Document updated successfully',
      data: documents,
    };
  }

  async getDocumentById(id: string) {
    const document = await this.prisma.propertyDocument.findUnique({
      where: { id },
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return {
      message: 'Document fetched successfully',
      data: document,
    };
  }

  async deleteDocument(id: string) {
    await this.getDocumentById(id);
    await this.prisma.propertyDocument.delete({ where: { id } });
    return {
      message: 'Document deleted successfully',
    };
  }
}
