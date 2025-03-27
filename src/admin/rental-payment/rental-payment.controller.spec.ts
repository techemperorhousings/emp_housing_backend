import { Test, TestingModule } from '@nestjs/testing';
import { RentalPaymentController } from './rental-payment.controller';
import { RentalPaymentService } from './rental-payment.service';

describe('RentalPaymentController', () => {
  let controller: RentalPaymentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RentalPaymentController],
      providers: [RentalPaymentService],
    }).compile();

    controller = module.get<RentalPaymentController>(RentalPaymentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
