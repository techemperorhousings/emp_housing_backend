import { PrismaClient } from '@prisma/client';
import Operations from './operations';
const ops = new Operations();

const prisma = new PrismaClient();

const APP_ROLES: Array<string> = [
  'ADMIN',
  'USER',
  'SUPPORT_STAFF',
  'SELLER',
  'BUYER',
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
enum AccessLevel {
  ALL = 'ALL',
  ADMIN = 'ADMIN',
  USER = 'USER',
  SELLER = 'SELLER',
  BUYER = 'BUYER',
  SUPPORT_STAFF = 'SUPPORT_STAFF',
}

type ACCESS_LEVEL = keyof typeof AccessLevel;

const PERMISSIONS: Array<{ name: string; access: ACCESS_LEVEL }> = [
  { name: 'READ', access: 'ALL' },
  { name: 'WRITE', access: 'ALL' },
  { name: 'DELETE', access: 'ADMIN' },
  { name: 'UPDATE', access: 'ADMIN' },
  { name: 'VIEW', access: 'ALL' },
  { name: 'CREATE', access: 'ADMIN' },
  { name: 'MANAGE', access: 'ADMIN' },
  { name: 'APPROVE', access: 'ADMIN' },
  { name: 'REJECT', access: 'ADMIN' },
  { name: 'UPDATE_PROPERTY', access: 'SELLER' },
  { name: 'BOOK_PROPERTY', access: 'BUYER' },
];

async function main() {
  //Create roles
  const rolePromises = APP_ROLES.map(async (role) => {
    return await ops.createRole(role);
  });

  // Create permissions and link to roles
  const createdRoles = await Promise.all(rolePromises);

  // Create permissions and link to roles
  const permissionPromises = PERMISSIONS.map(async (permission) => {
    return await ops.findOrCreatePermission(
      permission.name,
      permission.access,
      permission.access,
    );
  });

  const createdPermissions = await Promise.all(permissionPromises);

  // Link permissions to roles
  for (const role of createdRoles) {
    for (const permission of createdPermissions) {
      if (permission.access === 'ALL' || role.name === permission.access) {
        await ops.linkRolePermission(role.id, permission.id);
      }
    }
  }

  console.log('Seeding completed successfully.');
}

main()
  .then(() => {
    console.log('Database seeded successfully.');
  })
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
