import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // User from JWT
    const propertyId = request.params.id; // Property ID from URL params

    if (!user || !propertyId) {
      throw new ForbiddenException('Unauthorized access');
    }

    if (user.role.name === 'ADMIN') {
      return true;
    }

    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new ForbiddenException('Property not found');
    }

    if (property.ownerId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to modify this property',
      );
    }

    return true;
  }
}
