import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default class Operations {
  constructor() {}

  async createRole(role: string) {
    return await prisma.role.create({
      data: {
        name: role,
      },
    });
  }

  async findOrCreatePermission(name: string, role: string, access: string) {
    const existingPermission = await prisma.permission.findFirst({
      where: {
        name,
        role,
        access,
      },
    });

    if (existingPermission) {
      return existingPermission;
    }

    return await prisma.permission.create({
      data: {
        name,
        role,
        access,
      },
    });
  }

  async linkRolePermission(roleId: string, permissionId: string) {
    const existingLink = await prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });

    if (!existingLink) {
      await prisma.rolePermission.create({
        data: {
          roleId,
          permissionId,
        },
      });
    }
  }
}
