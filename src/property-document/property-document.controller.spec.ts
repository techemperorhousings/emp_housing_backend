import { Test, TestingModule } from '@nestjs/testing';
import { PropertyDocumentController } from './property-document.controller';
import { PropertyDocumentService } from './property-document.service';

describe('PropertyDocumentController', () => {
  let controller: PropertyDocumentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertyDocumentController],
      providers: [PropertyDocumentService],
    }).compile();

    controller = module.get<PropertyDocumentController>(PropertyDocumentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
