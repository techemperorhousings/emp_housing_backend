import { Test, TestingModule } from '@nestjs/testing';
import { PropertyDocumentService } from './property-document.service';

describe('PropertyDocumentService', () => {
  let service: PropertyDocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PropertyDocumentService],
    }).compile();

    service = module.get<PropertyDocumentService>(PropertyDocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
