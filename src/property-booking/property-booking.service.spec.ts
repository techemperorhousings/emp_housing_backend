import { Test, TestingModule } from '@nestjs/testing';
import { PropertyBookingService } from './property-booking.service';

describe('PropertyBookingService', () => {
  let service: PropertyBookingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PropertyBookingService],
    }).compile();

    service = module.get<PropertyBookingService>(PropertyBookingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
