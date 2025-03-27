import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateDocumentDto {
  @ApiProperty({ example: 'Deed of Agreement', description: 'Document name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'https://example.com/document.pdf',
    description: 'Document URL',
  })
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @ApiProperty({ example: 'PROPERTY_ID_123', description: 'Property ID' })
  @IsNotEmpty()
  @IsString()
  propertyId: string;
}

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {}
