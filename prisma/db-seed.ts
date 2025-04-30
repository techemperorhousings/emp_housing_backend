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
          title: faker.lorem.words(3),
          description: faker.lorem.paragraph(),
          price: new Prisma.Decimal(
            faker.finance.amount({ min: 100_000, max: 1_000_000, dec: 2 }),
          ),
          location: faker.location.city(),
          type: 'HOUSE',
          status: 'PENDING',
          ownerId: owner.id,
          isActive: true,

          // Address
          street: faker.location.street(),
          nearestLandMark: faker.location.street(),
          city: faker.location.city(),
          state: faker.location.state(),
          zipCode: faker.location.zipCode(),
          country: faker.location.country(),
          address: faker.location.streetAddress(),

          // Details
          bedrooms: faker.number.int({ min: 1, max: 6 }),
          bathrooms: faker.number.int({ min: 1, max: 4 }),
          area: faker.number.float({ min: 50, max: 300 }),
          yearBuilt: faker.number.int({ min: 1990, max: 2024 }),
        },
      });
    }),
  );

  //  Seed Listings for each property
  const listings = await Promise.all(
    properties.map((property) => {
      const listedBy = faker.helpers.arrayElement(users);
      return prisma.listing.create({
        data: {
          propertyId: property.id,
          listedById: listedBy.id,
          price: new Prisma.Decimal(
            faker.finance.amount({ min: 100_000, max: 1_000_000, dec: 2 }),
          ),
          status: 'PENDING',
          listingType: 'FOR_SALE',
          isActive: true,
        },
      });
    }),
  );

  console.log('✅ Seed complete:', {
    users: users.length,
    kycs: kycs.length,
    properties: properties.length,
    listings: listings.length,
  });
}
