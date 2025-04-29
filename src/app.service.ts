import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { seedUsersAndRelated } from 'prisma/db-seed';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}
  getHello(): string {
    return 'Hello World!';
  }

  //seed data in the db
  async seed() {
    await seedUsersAndRelated(this.prisma);

    return { message: 'Database seeded successfully' };
  }
}
