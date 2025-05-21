import { Prisma, PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { faker } from '@faker-js/faker';

export async function seedUsersAndRelated(prisma: PrismaClient) {
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
        },
      });
    }),
  );

  const kycs = await Promise.all(
    users.map((user) =>
      prisma.kYC.create({
        data: {
          userId: user.id,
          documentType: 'PASSPORT',
          documentUrl: faker.image.url(),
          status: 'PENDING',
          reason: faker.lorem.sentence(),
        },
      }),
    ),
  );

  const properties = await Promise.all(
    [...Array(20)].map(() => {
      const owner = faker.helpers.arrayElement(users);
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
          type: 'HOUSE', // Make sure this is a valid enum value
          status: 'PENDING', // Make sure this is a valid enum value
          ownerId: owner.id,

          // Property Details
          bedrooms: faker.number.int({ min: 1, max: 6 }),
          bathrooms: faker.number.int({ min: 1, max: 4 }),
          toilets: faker.number.int({ min: 1, max: 5 }),
          size: `${faker.number.int({ min: 50, max: 300 })} sqm`,
          parkingSpace: faker.number.int({ min: 0, max: 3 }),

          // Optional Array Fields
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

  console.log('✅ Seed complete:', {
    users: users.length,
    kycs: kycs.length,
    properties: properties.length,
  });
}
