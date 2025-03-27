import { Module } from '@nestjs/common';
import { RentalAgreementService } from './rental-agreement.service';
import { RentalAgreementController } from './rental-agreement.controller';

@Module({
  controllers: [RentalAgreementController],
  providers: [RentalAgreementService],
})
export class RentalAgreementModule {}
