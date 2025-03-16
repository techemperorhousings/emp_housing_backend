import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateKycDto } from './dto/index.dto';

@Injectable()
export class KycService {
  constructor(private readonly prisma: PrismaService) {}

  async submitKyc(dto: CreateKycDto, userId) {
    const existingKyc = await this.prisma.kYC.findUnique({
      where: { userId },
    });

    if (existingKyc && existingKyc.status === 'PENDING') {
      throw new BadRequestException('KYC already submitted and under review.');
    }

    if (existingKyc && existingKyc.status === 'APPROVED') {
      throw new BadRequestException('KYC is already approved.');
    }

    const kyc = await this.prisma.kYC.upsert({
      where: { userId },
      update: {
        ...dto,
        status: 'PENDING',
      },
      create: {
        userId,
        ...dto,
        status: 'PENDING',
      },
    });
    return {
      message: 'KYC submitted successfully',
      data: kyc,
    };
  }

  //get kyc status
  async getKycStatus(userId: string) {
    const kyc = await this.prisma.kYC.findUnique({ where: { userId } });
    if (!kyc) throw new NotFoundException('KYC record not found');
    return {
      message: 'KYC status fetched successfully',
      data: kyc,
    };
  }
}
