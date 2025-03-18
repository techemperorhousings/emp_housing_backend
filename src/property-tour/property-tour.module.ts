import { Module } from '@nestjs/common';
import { PropertyTourService } from './property-tour.service';
import { PropertyTourController } from './property-tour.controller';

@Module({
  controllers: [PropertyTourController],
  providers: [PropertyTourService],
})
export class PropertyTourModule {}
