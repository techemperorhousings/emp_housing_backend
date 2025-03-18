import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationModule } from '@authentication/authentication.module';
import { MailModule } from '@mail/mail.module';
import { PrismaModule } from '@prisma/prisma.module';
import { UserModule } from '@user/user.module';
import { FileUploadModule } from '@file-upload/file-upload.module';
import { KycModule } from '@kyc/kyc.module';
import { ListingModule } from '@listing/listing.module';
import { PropertyModule } from '@property/property.module';
import { PurchaseModule } from '@purchase/purchase.module';
import { RentalAgreementModule } from '@rental/rental-agreement.module';
import { FavoriteModule } from '@favorite/favorite.module';
import { OfferModule } from '@offer/offer.module';
import { PropertyBookingModule } from '@property-booking/property-booking.module';
import { PropertyDocumentModule } from '@property-document/property-document.module';
import { PropertyTourModule } from '@property-tour/property-tour.module';
import { RentalPaymentModule } from '@rental-payment/rental-payment.module';
import { ReviewModule } from '@review/review.module';
import { SupportTicketModule } from '@support-ticket/support-ticket.module';

export const modules = [
  ConfigModule.forRoot({
    isGlobal: true,
  }),
  PassportModule.register({ defaultStrategy: 'jwt', session: false }),
  JwtModule.register({
    secret: process.env.SECRET_KEY_JWT,
  }),
  PrismaModule,
  AuthenticationModule,
  MailModule,
  UserModule,
  KycModule,
  FileUploadModule,
  PropertyModule,
  ListingModule,
  RentalAgreementModule,
  PropertyBookingModule,
  PurchaseModule,
  PropertyDocumentModule,
  RentalPaymentModule,
  PropertyTourModule,
  OfferModule,
  ReviewModule,
  FavoriteModule,
  SupportTicketModule,
];
