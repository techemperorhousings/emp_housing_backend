import { KycModule } from '@admin/kyc/kyc.module';
import { ListingModule } from '@admin/listing/listing.module';
import { PropertyBookingModule } from '@admin/property-booking/property-booking.module';
import { PropertyModule } from '@admin/property/property.module';
import { UserModule } from '@admin/user/user.module';

export const adminModules = [
  UserModule,
  KycModule,
  PropertyModule,
  ListingModule,
  PropertyBookingModule,
];
