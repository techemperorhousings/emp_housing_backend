import { Test, TestingModule } from '@nestjs/testing';
import { PropertyBookingController } from './property-booking.controller';
import { PropertyBookingService } from './property-booking.service';

describe('PropertyBookingController', () => {
  let controller: PropertyBookingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertyBookingController],
      providers: [PropertyBookingService],
    }).compile();

    controller = module.get<PropertyBookingController>(PropertyBookingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
