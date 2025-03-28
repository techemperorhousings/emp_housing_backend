import { PERMISSIONS_KEY } from '@decorators/permission.decorator';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';
import { ACCESS_LEVEL, GET_ROLE_AND_PERMISSIONS } from '@utils';

const prisma = new PrismaClient();

export interface permissionObject {
  name: string;
  access: ACCESS_LEVEL | Array<ACCESS_LEVEL>;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<
      permissionObject[] | permissionObject
    >(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]);
    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false;
    }

    try {
      const userWithPermissions = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          ...GET_ROLE_AND_PERMISSIONS,
        },
      });

      if (!userWithPermissions) {
        Logger.warn('No user found in the database with the given ID');
        return false;
      }

      // TODO: MAKE THIS FUNCTION BELOW BETTER
      const roleName = userWithPermissions.role.name;
      if (roleName == 'SUPER_ADMIN') {
        const _allPermissions = await prisma.permission.findMany();
        // Map over _allPermissions and wrap each item in an object with a 'permission' property
        userWithPermissions.role.permissions = _allPermissions.map(
          (permission) => ({
            permission: {
              name: permission.name,
              access: roleName,
            },
          }),
        );
      }

      // Logger.log('userWithPermissions', userWithPermissions.role.permissions);

      const permissionsArray = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      // Logger.log('permissionsArray', permissionsArray[0].access);

      const hasPermission = permissionsArray.every((permission) =>
        userWithPermissions.role.permissions.some(
          ({ permission: { access, name } }) => {
            if (Array.isArray(permission.access)) {
              return (
                permission.access.includes(access as ACCESS_LEVEL) &&
                name === permission.name
              );
            } else {
              return access === permission.access && name === permission.name;
            }
          },
        ),
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          `You don't have the required permission (${permissionsArray.map((p) => p.name).join(', ')}) or access level (${permissionsArray
            .map((p) => p.access)
            .flat()
            .join(', ')})`,
        );
      }

      return hasPermission;
    } catch (error) {
      Logger.error('Error checking permissions:', error);
      throw new Error(error);
    }
  }
}
