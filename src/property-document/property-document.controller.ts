import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PropertyDocumentService } from './property-document.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/index.dto';

@ApiTags('Property Document')
@ApiBearerAuth('JWT-auth')
@Controller('property-document')
export class PropertyDocumentController {
  constructor(private readonly service: PropertyDocumentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload a document for a property' })
  async createDocument(@Body() dto: CreateDocumentDto) {
    return this.service.createDocument(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':propertyId')
  @ApiOperation({ summary: 'Get all documents for a property' })
  async getDocumentsByProperty(@Param('propertyId') propertyId: string) {
    return this.service.getDocumentsByProperty(propertyId);
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a document' })
  async updateDocument(
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.service.updateDocument(id, dto);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document' })
  async deleteDocument(@Param('id') id: string) {
    return this.service.deleteDocument(id);
  }
}
