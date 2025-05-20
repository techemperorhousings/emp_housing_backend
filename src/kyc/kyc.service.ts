import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateKycDto, GetKycQueryDto } from './dto/index.dto';
import { KYC, KycStatus } from '@prisma/client';
import { PaginatedResponse } from '@utils/pagination';

@Injectable()
export class KycService {
  constructor(private readonly prisma: PrismaService) {}
  async submitKyc(dto: CreateKycDto, userId): Promise<KYC> {
    const existingKyc = await this.prisma.kYC.findUnique({
      where: { userId },
    });

    if (existingKyc && existingKyc.status === 'PENDING') {
      throw new BadRequestException('KYC already submitted and under review.');
    }

    if (existingKyc && existingKyc.status === 'APPROVED') {
      throw new BadRequestException('KYC is already approved.');
    }

    return await this.prisma.kYC.upsert({
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
  }

  //get kyc status
  async getKycStatus(userId: string) {
    const kyc = await this.prisma.kYC.findUnique({ where: { userId } });
    if (!kyc) throw new NotFoundException('KYC record not found');
    return kyc;
  }

  /**********************Admin Services **********/
  async getAllKyc(query: GetKycQueryDto): Promise<PaginatedResponse<KYC>> {
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
      data: kycSubmissions,
      total,
      skip,
      take,
    };
  }

  //get kyc by user id
  async getKycById(userId: string): Promise<KYC> {
    const kyc = await this.prisma.kYC.findUnique({
      where: { userId },
    });
    if (!kyc) {
      throw new NotFoundException('KYC for user record not found');
    }
    return kyc;
  }

  //approve kyc
  async approveKyc(kycId: string, adminId: string): Promise<KYC> {
    const kyc = await this.getKycById(kycId);

    if (kyc.status === KycStatus.APPROVED) {
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

    return _kyc;
  }

  //reject kyc
  async rejectKyc(
    kycId: string,
    adminId: string,
    reason: string,
  ): Promise<KYC> {
    const kyc = await this.getKycById(kycId);

    //check if admin exists
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    if (kyc.status === KycStatus.REJECTED) {
      throw new BadRequestException('KYC submission is already rejected');
    }
    const _kyc = await this.prisma.kYC.update({
      where: { id: kycId },
      data: { status: KycStatus.REJECTED, reason, reviewerId: adminId },
    });
    return _kyc;
  }
}
