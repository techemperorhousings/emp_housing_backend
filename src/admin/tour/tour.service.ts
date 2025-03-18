import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { FilterDto } from './dto/index.dto';
import { TourStatus } from '@prisma/client';

@Injectable()
export class TourService {
  constructor(private readonly prisma: PrismaService) {}

  //get all tours
  async getAllTours(filterDto: FilterDto) {
    const { skip, take, status } = filterDto;

    const tours = this.prisma.propertyTour.findMany({
      skip,
      take,
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
    });
    return {
      message: 'Tours fetched successfully',
      data: tours,
    };
  }

  //get tour by id
  async getTourById(tourId: string) {
    const tour = await this.prisma.propertyTour.findUnique({
      where: { id: tourId },
    });
    if (!tour) throw new NotFoundException('Tour not found');
    return {
      message: 'Tour fetched successfully',
      data: tour,
    };
  }

  //assign tour to agent
  async assignTourToAgent(tourId: string, agentId: string) {
    await this.getTourById(tourId);
    //check if agent exists
    const agent = await this.prisma.user.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    // assign tour to agent
    const tour = await this.prisma.propertyTour.update({
      where: { id: tourId },
      data: { agentId },
    });
    return {
      message: 'Tour agent assigned successfully',
      data: tour,
    };
  }

  //update tour status
  async updateTourStatus(tourId: string, status: TourStatus) {
    await this.getTourById(tourId);

    const updatedTour = await this.prisma.propertyTour.update({
      where: { id: tourId },
      data: { status },
    });

    return {
      message: 'Tour status updated successfully',
      data: updatedTour,
    };
  }
}
