import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InquiryStatus } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { CreateContactInquiryDto } from './dtos/create-inquiry.dto';
import { QueryContactInquiryDto } from './dtos/query-inquiry.dto';
import { UpdateContactInquiryDto } from './dtos/update-inquiry.dto';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new contact inquiry
   */
  async create(
    createDto: CreateContactInquiryDto,
  ): Promise<Record<string, string>> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // 🧠 Simpler spam rate limit by email within the last hour
    const inquiryCount = await this.prisma.contactInquiry.count({
      where: {
        email: createDto.email,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (inquiryCount >= 3) {
      throw new BadRequestException(
        'Too many inquiries. Please try again later.',
      );
    }

    await this.prisma.contactInquiry.create({
      data: {
        ...createDto,
        status: InquiryStatus.NEW,
      },
    });

    return { message: 'Inquiry Submitted successfully' };
  }

  /**
   * Find all inquiries with filtering and pagination
   */
  async findAll(query: QueryContactInquiryDto) {
    const { status, email, skip = 0, take = 10 } = query;

    const where: any = {};

    if (status) where.status = status;
    if (email) where.email = { contains: email, mode: 'insensitive' };

    const [inquiries, total] = await Promise.all([
      this.prisma.contactInquiry.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contactInquiry.count({ where }),
    ]);

    return {
      data: inquiries,
      meta: {
        total,
        skip,
        take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * Find one inquiry by ID
   */
  async findOne(id: string) {
    const inquiry = await this.prisma.contactInquiry.findUnique({
      where: { id },
    });

    if (!inquiry) {
      throw new NotFoundException(`Contact inquiry not found`);
    }

    return inquiry;
  }

  /**
   * Update inquiry status
   */
  async updateStatus(id: string, { status }: UpdateContactInquiryDto) {
    const inquiry = await this.findOne(id);

    const respondedAt =
      status === InquiryStatus.RESPONDED && !inquiry.respondedAt
        ? new Date()
        : inquiry.respondedAt;

    return this.prisma.contactInquiry.update({
      where: { id },
      data: { status, respondedAt },
    });
  }

  /**
   * Delete inquiry
   */
  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.contactInquiry.delete({ where: { id } });
    return { message: 'Inquiry deleted successfully' };
  }

  /**
   * Get inquiry statistics
   */
  async getStats() {
    const [total, newCount, inProgressCount, respondedCount] =
      await Promise.all([
        this.prisma.contactInquiry.count(),
        this.prisma.contactInquiry.count({
          where: { status: InquiryStatus.NEW },
        }),
        this.prisma.contactInquiry.count({
          where: { status: InquiryStatus.IN_PROGRESS },
        }),
        this.prisma.contactInquiry.count({
          where: { status: InquiryStatus.RESPONDED },
        }),
      ]);

    return {
      total,
      byStatus: {
        new: newCount,
        inProgress: inProgressCount,
        responded: respondedCount,
      },
    };
  }

  /**
   * Get recent inquiries (last 7 days)
   */
  async getRecent(limit = 10) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    return this.prisma.contactInquiry.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
