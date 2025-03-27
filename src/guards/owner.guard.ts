import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Extract user from JWT
    const resourceId = request.params.id; // Get resource ID from URL params
    const resourceType = this.reflector.get<string>(
      'owner',
      context.getHandler(),
    ); // Get resource type from decorator
    if (!user || !resourceId || !resourceType) {
      throw new ForbiddenException('Unauthorized access');
    }

    // Fetch the resource dynamically based on type
    let resource;
    switch (resourceType) {
      case 'property':
        resource = await this.prisma.property.findUnique({
          where: { id: resourceId },
        });
        break;
      case 'listing':
        resource = await this.prisma.listing.findUnique({
          where: { id: resourceId },
        });
        break;
      default:
        throw new ForbiddenException('Invalid resource type');
    }

    if (!resource) {
      throw new ForbiddenException('Resource not found');
    }

    // Ensure the logged-in user is the owner
    if (resource.ownerId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to modify this resource',
      );
    }

    return true;
  }
}
