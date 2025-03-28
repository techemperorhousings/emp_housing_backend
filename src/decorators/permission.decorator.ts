// permission.decorator.ts
import { permissionObject } from '@guards/permissions.guard';
import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: permissionObject[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
