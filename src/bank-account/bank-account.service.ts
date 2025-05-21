import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { AddAccountDto } from './dto/add-account.dto';
import { BankAccount, Prisma } from '@prisma/client';
import { UpdateAccountDto } from './dto/UpdateAccountDto';

@Injectable()
export class BankAccountService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: AddAccountDto): Promise<BankAccount> {
    try {
      // Count existing bank accounts for this user
      const count = await this.prisma.bankAccount.count({
        where: { userId },
      });

      if (count >= 2) {
        throw new BadRequestException(
          'You can only have up to two bank accounts.',
        );
      }

      return this.prisma.bankAccount.create({
        data: {
          user: { connect: { id: userId } },
          ...dto,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException(
          'This bank account already exists for the user.',
        );
      }
      throw error;
    }
  }

  // Get all bank accounts for a user
  async getAllBankAccounts(userId: string): Promise<BankAccount[]> {
    return this.prisma.bankAccount.findMany({
      where: { userId },
    });
  }

  async findOne(id: string, userId: string) {
    const account = await this.prisma.bankAccount.findFirst({
      where: { id, userId },
    });
    if (!account) throw new BadRequestException('Bank account not found');
    return account;
  }

  async update(id: string, userId: string, dto: UpdateAccountDto) {
    await this.findOne(id, userId);

    return this.prisma.bankAccount.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.bankAccount.delete({
      where: { id },
    });
  }
}
