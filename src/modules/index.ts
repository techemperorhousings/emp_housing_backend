import { AuthenticationModule } from '@authentication/authentication.module';
import { FavoriteModule } from '@favorite/favorite.module';
import { KycModule } from '@kyc/kyc.module';
import { ListingModule } from '@listing/listing.module';
import { MailModule } from '@mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { OfferModule } from '@offer/offer.module';
import { PrismaModule } from '@prisma/prisma.module';
import { PropertyBookingModule } from '@property-booking/property-booking.module';
import { PropertyTourModule } from '@property-tour/property-tour.module';
import { PropertyModule } from '@property/property.module';
import { PurchaseModule } from '@purchase/purchase.module';
import { RentalPaymentModule } from '@rental-payment/rental-payment.module';
import { ReviewModule } from '@review/review.module';
import { SupportTicketModule } from '@support-ticket/support-ticket.module';
import { ChatModule } from '@chat/chat.module';
import { UserModule } from '@user/user.module';
import { RoleModule } from '@role/role.module';
// import { ChatModule } from '@chat/chat.module';

export const modules = [
  ConfigModule.forRoot({
    isGlobal: true,
  }),
  PassportModule.register({ defaultStrategy: 'jwt', session: false }),
  JwtModule.register({
    secret: process.env.JWT_SECRET,
  }),
  PrismaModule,
  AuthenticationModule,
  ChatModule,
  MailModule,
  UserModule,
  KycModule,
  PropertyModule,
  ListingModule,
  PropertyBookingModule,
  PurchaseModule,
  RentalPaymentModule,
  PropertyTourModule,
  OfferModule,
  ReviewModule,
  FavoriteModule,
  SupportTicketModule,
  RoleModule,
];
