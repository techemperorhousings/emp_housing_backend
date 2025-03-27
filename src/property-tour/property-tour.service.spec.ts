import { Test, TestingModule } from '@nestjs/testing';
import { PropertyTourService } from './property-tour.service';

describe('PropertyTourService', () => {
  let service: PropertyTourService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PropertyTourService],
    }).compile();

    service = module.get<PropertyTourService>(PropertyTourService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
