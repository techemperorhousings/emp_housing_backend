import { Module } from '@nestjs/common';
import { PropertyBookingService } from './property-booking.service';
import { PropertyBookingController } from './property-booking.controller';

@Module({
  controllers: [PropertyBookingController],
  providers: [PropertyBookingService],
})
export class PropertyBookingModule {}
