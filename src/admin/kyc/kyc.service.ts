import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { KycStatus } from '@prisma/client';
import { GetKycQueryDto } from './dto/index.dto';

@Injectable()
export class KycService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllKyc(query: GetKycQueryDto) {
    const { skip, take, status } = query;

    const where = status ? { status } : {};

    const [kycSubmissions, total] = await Promise.all([
      this.prisma.kYC.findMany({
        skip,
        take,
        where,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.kYC.count({ where }),
    ]);
    return {
      message: 'KYC submissions fetched successfully',
      data: kycSubmissions,
      total,
      skip,
      take,
    };
  }

  //get kyc by id
  async getKycById(kycId: string) {
    const kyc = await this.prisma.kYC.findUnique({
      where: { id: kycId },
    });
    if (!kyc) {
      throw new NotFoundException('KYC record not found');
    }
    return {
      message: 'KYC fetched successfully',
      data: kyc,
    };
  }

  //approve kyc
  async approveKyc(kycId: string, adminId: string) {
    const kyc = await this.getKycById(kycId);
    //check if admin exists
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    if (kyc.data.status === KycStatus.APPROVED) {
      throw new BadRequestException('KYC submission is already approved');
    }

    //update kyc status and also user kycVerified
    const _kyc = await this.prisma.$transaction(async (tx) => {
      const updatedKYC = await tx.kYC.update({
        where: { id: kycId },
        data: { status: KycStatus.APPROVED, reviewerId: adminId, reason: null },
      });

      await tx.user.update({
        where: { id: updatedKYC.userId },
        data: { kycVerified: true },
      });
      return updatedKYC;
    });

    return {
      message: 'KYC approved successfully',
      data: _kyc,
    };
  }

  //reject kyc
  async rejectKyc(kycId: string, adminId: string, reason: string) {
    const kyc = await this.getKycById(kycId);

    //check if admin exists
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    if (kyc.data.status === KycStatus.REJECTED) {
      throw new BadRequestException('KYC submission is already rejected');
    }
    const _kyc = await this.prisma.kYC.update({
      where: { id: kycId },
      data: { status: KycStatus.REJECTED, reason, reviewerId: adminId },
    });
    return {
      message: 'KYC rejected successfully',
      data: _kyc,
    };
  }
}
