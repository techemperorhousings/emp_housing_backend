import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreatePropertyTourDto, FilterDto } from './dto/index.dto';
import { PropertyTour, TourStatus } from '@prisma/client';

@Injectable()
export class PropertyTourService {
  constructor(private readonly prisma: PrismaService) {}

  async createTour(dto: CreatePropertyTourDto): Promise<PropertyTour> {
    // Ensure the property and listing exist
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });
    if (!property) throw new NotFoundException('Property not found');

    const existingTour = await this.prisma.propertyTour.findFirst({
      where: {
        requestedById: dto.requestedById,
        propertyId: dto.propertyId,
        status: { notIn: ['CANCELLED', 'COMPLETED', 'NO_SHOW', 'REJECTED'] }, // user can only schedule a new tour if their previous one was canceled, completed, no-show, or rejected.
      },
    });

    if (existingTour) {
      throw new BadRequestException(
        'You already have an active tour for this property. Complete or cancel it before scheduling a new one.',
      );
    }

    return await this.prisma.propertyTour.create({
      data: {
        ...dto,
        scheduledDate: new Date(dto.scheduledDate),
      },
    });
  }

  //get user tour requests
  async getUserTours(userId: string): Promise<PropertyTour[]> {
    return await this.prisma.propertyTour.findMany({
      where: { requestedById: userId },
      include: {
        property: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async getTourById(id: string): Promise<PropertyTour> {
    const tour = await this.prisma.propertyTour.findUnique({
      where: { id },
    });

    if (!tour) throw new NotFoundException('Tour not found');

    return tour;
  }

  async cancelTour(id: string): Promise<PropertyTour> {
    const isTour = await this.getTourById(id);

    if (isTour.status !== 'PENDING') {
      throw new BadRequestException('Only pending tours can be cancelled');
    }

    return await this.prisma.propertyTour.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  //submit feedback after tour
  async submitFeedback(id: string, feedback: string): Promise<PropertyTour> {
    await this.getTourById(id);

    return await this.prisma.propertyTour.update({
      where: { id },
      data: { feedback },
    });
  }

  //get all tours for an agent
  async getAgentTours(agentId: string): Promise<PropertyTour[]> {
    return await this.prisma.propertyTour.findMany({
      where: { agentId },
    });
  }

  //update tour status
  async updateTourStatus(
    id: string,
    status: TourStatus,
  ): Promise<PropertyTour> {
    await this.getTourById(id);

    return await this.prisma.propertyTour.update({
      where: { id },
      data: { status },
    });
  }

  async getToursByStatus(status: TourStatus): Promise<PropertyTour[]> {
    return await this.prisma.propertyTour.findMany({
      where: { status },
    });
  }

  async getToursByProperty(propertyId: string): Promise<PropertyTour[]> {
    return await this.prisma.propertyTour.findMany({
      where: { propertyId },
    });
  }

  //assign tour to agent
  async assignTourToAgent(
    tourId: string,
    agentId: string,
  ): Promise<PropertyTour> {
    await this.getTourById(tourId);
    //check if agent exists
    const agent = await this.prisma.user.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    // assign tour to agent
    return await this.prisma.propertyTour.update({
      where: { id: tourId },
      data: { agentId },
    });
  }

  //get all tours
  async getAllTours(filterDto: FilterDto): Promise<PropertyTour[]> {
    const { skip, take, status } = filterDto;

    return this.prisma.propertyTour.findMany({
      skip,
      take,
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
    });
  }
}
