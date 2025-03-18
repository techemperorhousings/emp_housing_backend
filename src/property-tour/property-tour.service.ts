import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreatePropertyTourDto } from './dto/index.dto';
import { TourStatus } from '@prisma/client';

@Injectable()
export class PropertyTourService {
  constructor(private readonly prisma: PrismaService) {}

  async createTour(dto: CreatePropertyTourDto) {
    // Ensure the property and listing exist
    const [property, listing] = await Promise.all([
      this.prisma.property.findUnique({
        where: { id: dto.propertyId },
      }),
      this.prisma.listing.findUnique({
        where: { id: dto.listingId },
      }),
    ]);
    if (!property) throw new NotFoundException('Property not found');

    if (!listing) throw new NotFoundException('Listing not found');

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

    const tour = await this.prisma.propertyTour.create({
      data: {
        ...dto,
        scheduledDate: new Date(dto.scheduledDate),
      },
    });
    return {
      message: 'Tour requested successfully',
      data: tour,
    };
  }

  //get user tour requests
  async getUserTours(userId: string) {
    const tours = await this.prisma.propertyTour.findMany({
      where: { requestedById: userId },
      include: {
        property: {
          select: {
            title: true,
          },
        },
      },
    });
    return {
      message: 'User tours fetched successfully',
      data: tours,
    };
  }

  async getTourById(id: string) {
    const tour = await this.prisma.propertyTour.findUnique({
      where: { id },
    });

    if (!tour) throw new NotFoundException('Tour not found');

    return {
      message: 'Tour fetched successfully',
      data: tour,
    };
  }

  async cancelTour(id: string) {
    const isTour = await this.getTourById(id);

    if (isTour.data.status !== 'PENDING') {
      throw new BadRequestException('Only pending tours can be cancelled');
    }

    const cancelledTour = await this.prisma.propertyTour.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return {
      message: 'Tour cancelled successfully',
      data: cancelledTour,
    };
  }

  //submit feedback after tour
  async submitFeedback(id: string, feedback: string) {
    await this.getTourById(id);

    const updatedTour = await this.prisma.propertyTour.update({
      where: { id },
      data: { feedback },
    });

    return {
      message: 'Feedback submitted successfully',
      data: updatedTour,
    };
  }

  //get all tours for an agent
  async getAgentTours(agentId: string) {
    const tours = await this.prisma.propertyTour.findMany({
      where: { agentId },
    });
    return {
      message: 'Agent tours fetched successfully',
      data: tours,
    };
  }

  //update tour status
  async updateTourStatus(id: string, status: TourStatus) {
    await this.getTourById(id);

    const updatedTour = await this.prisma.propertyTour.update({
      where: { id },
      data: { status },
    });

    return {
      message: 'Tour status updated successfully',
      data: updatedTour,
    };
  }

  async getToursByStatus(status: TourStatus) {
    const tours = await this.prisma.propertyTour.findMany({
      where: { status },
    });
    return {
      message: 'Tours fetched successfully',
      data: tours,
    };
  }

  async getToursByProperty(propertyId: string) {
    const tours = await this.prisma.propertyTour.findMany({
      where: { propertyId },
    });
    return {
      message: 'Tours fetched successfully',
      data: tours,
    };
  }
}
