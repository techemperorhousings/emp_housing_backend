import { Test, TestingModule } from '@nestjs/testing';
import { RentalAgreementService } from './rental-agreement.service';

describe('RentalAgreementService', () => {
  let service: RentalAgreementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RentalAgreementService],
    }).compile();

    service = module.get<RentalAgreementService>(RentalAgreementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
