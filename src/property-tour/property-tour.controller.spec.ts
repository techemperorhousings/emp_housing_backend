import { Test, TestingModule } from '@nestjs/testing';
import { PropertyTourController } from './property-tour.controller';
import { PropertyTourService } from './property-tour.service';

describe('PropertyTourController', () => {
  let controller: PropertyTourController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertyTourController],
      providers: [PropertyTourService],
    }).compile();

    controller = module.get<PropertyTourController>(PropertyTourController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
