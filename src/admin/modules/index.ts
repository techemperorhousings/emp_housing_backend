import { KycModule } from '@admin/kyc/kyc.module';
import { ListingModule } from '@admin/listing/listing.module';
import { PropertyBookingModule } from '@admin/property-booking/property-booking.module';
import { PropertyModule } from '@admin/property/property.module';
import { PurchaseModule } from '@admin/purchase/purchase.module';
import { RentalAgreementModule } from '@admin/rental-agreement/rental-agreement.module';
import { RentalPaymentModule } from '@admin/rental-payment/rental-payment.module';
import { TourModule } from '@admin/tour/tour.module';
import { UserModule } from '@admin/user/user.module';

export const adminModules = [
  UserModule,
  KycModule,
  PropertyModule,
  ListingModule,
  PropertyBookingModule,
  RentalAgreementModule,
  RentalPaymentModule,
  PurchaseModule,
  TourModule,
];
