import { Reflector } from '@nestjs/core';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user; // Extract user from JWT
    const resourceId = (request as any).id; // Get resource ID from URL params
    const resourceType = this.reflector.get<string>(
      'resource',
      context.getHandler(),
    ); // Get resource type from decorator

    if (!user || !resourceId || !resourceType) {
      throw new ForbiddenException('Unauthorized access');
    }

    // // Fetch the resource dynamically from the database
    // let resource;
    // if (resourceType === 'property') {
    //   resource = await this.prisma.property.findUnique({
    //     where: { id: resourceId },
    //   });
    // } else if (resourceType === 'listing') {
    //   resource = await this.prisma.listing.findUnique({
    //     where: { id: resourceId },
    //   });
    // }

    // if (!resource) {
    //   throw new ForbiddenException('Resource not found');
    // }

    // // Ensure the logged-in user is the owner
    // if (resource.ownerId !== user.id) {
    //   throw new ForbiddenException(
    //     'You do not have permission to modify this resource',
    //   );
    // }

    return true;
  }
}
