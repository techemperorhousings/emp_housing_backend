import { Test, TestingModule } from '@nestjs/testing';
import { RentalAgreementController } from './rental-agreement.controller';
import { RentalAgreementService } from './rental-agreement.service';

describe('RentalAgreementController', () => {
  let controller: RentalAgreementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RentalAgreementController],
      providers: [RentalAgreementService],
    }).compile();

    controller = module.get<RentalAgreementController>(RentalAgreementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
