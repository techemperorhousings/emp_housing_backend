import { Module } from '@nestjs/common';
import { RentalPaymentService } from './rental-payment.service';
import { RentalPaymentController } from './rental-payment.controller';

@Module({
  controllers: [RentalPaymentController],
  providers: [RentalPaymentService],
})
export class RentalPaymentModule {}
