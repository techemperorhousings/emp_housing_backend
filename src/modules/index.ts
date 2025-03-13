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
import { RentalModule } from '@rental/rental.module';

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
  RentalModule,
  PurchaseModule,
];
