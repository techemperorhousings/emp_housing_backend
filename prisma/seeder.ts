import { Prisma, PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { faker } from '@faker-js/faker';

export async function seedUsersAndRelated(prisma: PrismaClient) {
  const roleId = '25051b63-f39f-43d8-8498-3a159bfa2625';

  // Create 20 users
  const users = await Promise.all(
    [...Array(20)].map(async () => {
      const password = await argon2.hash('Password@123');

      return prisma.user.create({
        data: {
          email: faker.internet.email().toLowerCase(),
          password,
          firstname: faker.person.firstName(),
          lastname: faker.person.lastName(),
          phoneNumber: faker.number
            .int({ min: 0, max: 99999999999 })
            .toString()
            .padStart(11, '0'),
          profileImage: faker.image.avatar(),
          roleId, // Assign role to each user
        },
      });
    }),
  );

  // Create KYC records for each user
  const kycs = await Promise.all(
    users.map((user) =>
      prisma.kYC.create({
        data: {
          userId: user.id,
          documentType: 'PASSPORT',
          documentUrl: faker.image.url(),
          status: 'APPROVED',
          reason: faker.lorem.sentence(),
        },
      }),
    ),
  );

  // Create 5 properties for each user
  const properties = await Promise.all(
    users.map(async (user) => {
      const userProperties = await Promise.all(
        [...Array(5)].map(() => {
          return prisma.property.create({
            data: {
              name: faker.lorem.words(3),
              description: faker.lorem.paragraph(),
              price: new Prisma.Decimal(
                faker.finance.amount({ min: 100_000, max: 1_000_000, dec: 2 }),
              ),
              minPrice: new Prisma.Decimal(
                faker.finance.amount({ min: 80_000, max: 900_000, dec: 2 }),
              ),
              address: faker.location.streetAddress(),
              type: 'HOUSE',
              status: 'APPROVED',
              ownerId: user.id,

              // Property details
              bedrooms: faker.number.int({ min: 1, max: 6 }),
              bathrooms: faker.number.int({ min: 1, max: 4 }),
              toilets: faker.number.int({ min: 1, max: 5 }),
              size: `${faker.number.int({ min: 50, max: 300 })} sqm`,
              parkingSpace: faker.number.int({ min: 0, max: 3 }),

              // Optional array fields
              features: faker.helpers.arrayElements(
                ['Pool', 'WiFi', 'AC', 'Garage', 'Garden', 'Gym'],
                faker.number.int({ min: 1, max: 4 }),
              ),
              images: [faker.image.url(), faker.image.url(), faker.image.url()],
              propertyDocument: faker.system.fileName(),
            },
          });
        }),
      );

      return userProperties;
    }),
  );

  const allProperties = properties.flat();

  console.log('✅ Seed complete:', {
    users: users.length,
    kycs: kycs.length,
    properties: allProperties.length,
  });
}
