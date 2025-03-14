import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { ApproveKycDto, CreateKycDto, RejectKycDto } from './dto/index.dto';
import { KycStatus } from '@prisma/client';

@Injectable()
export class KycService {
  constructor(private readonly prisma: PrismaService) {}

  async submitKyc(dto: CreateKycDto) {
    const existingKyc = await this.prisma.kYC.findUnique({
      where: { userId: dto.userId },
    });

    if (existingKyc) {
      throw new ConflictException('KYC already submitted');
    }

    const kyc = await this.prisma.kYC.create({ data: dto });
    return {
      message: 'KYC submitted successfully',
      data: kyc,
    };
  }

  async getKycByUser(userId: string) {
    const kyc = await this.prisma.kYC.findUnique({ where: { userId } });
    if (!kyc) throw new NotFoundException('KYC record not found');
    return {
      message: 'KYC fetched successfully',
      data: kyc,
    };
  }

  async getAllKycs() {
    const kycs = await this.prisma.kYC.findMany();
    return {
      message: 'KYCs fetched successfully',
      data: kycs,
    };
  }

  async approveKyc(dto: ApproveKycDto) {
    const kyc = await this.prisma.kYC.findUnique({
      where: { id: dto.kycId },
    });

    if (!kyc) {
      throw new NotFoundException('KYC record not found');
    }

    if (kyc.status !== KycStatus.PENDING) {
      throw new BadRequestException('KYC is already processed');
    }

    const newKyc = await this.prisma.kYC.update({
      where: { id: dto.kycId },
      data: { status: KycStatus.APPROVED },
    });

    //update kycVerified to true
    await this.prisma.user.update({
      where: { id: kyc.userId },
      data: { kycVerified: true },
    });

    return {
      message: 'KYC approved successfully',
      data: newKyc,
    };
  }

  async rejectKyc(dto: RejectKycDto) {
    const kyc = await this.prisma.kYC.findUnique({
      where: { id: dto.kycId },
    });
    if (!kyc) {
      throw new NotFoundException('KYC record not found');
    }

    if (kyc.status !== KycStatus.PENDING) {
      throw new BadRequestException('KYC is already processed');
    }

    await this.prisma.kYC.update({
      where: { id: dto.kycId },
      data: {
        status: KycStatus.REJECTED,
        reason: dto.reason,
      },
    });
    return {
      message: 'KYC rejected successfully',
      data: dto,
    };
  }

  async deleteKyc(id: string) {
    const kyc = await this.prisma.kYC.findUnique({
      where: { id },
    });

    if (!kyc) {
      throw new NotFoundException('KYC record not found');
    }
    await this.prisma.kYC.delete({ where: { id } });
    return {
      message: 'KYC deleted successfully',
    };
  }
}
