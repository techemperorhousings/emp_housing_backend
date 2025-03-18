import { Module } from '@nestjs/common';
import { PropertyDocumentService } from './property-document.service';
import { PropertyDocumentController } from './property-document.controller';

@Module({
  controllers: [PropertyDocumentController],
  providers: [PropertyDocumentService],
})
export class PropertyDocumentModule {}
