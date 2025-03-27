import { Test, TestingModule } from '@nestjs/testing';
import { RentalPaymentService } from './rental-payment.service';

describe('RentalPaymentService', () => {
  let service: RentalPaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RentalPaymentService],
    }).compile();

    service = module.get<RentalPaymentService>(RentalPaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
