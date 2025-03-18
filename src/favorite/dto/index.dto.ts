import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFavoriteDto {
  @ApiProperty({ description: 'ID of the property to be favorited' })
  @IsNotEmpty()
  @IsUUID()
  propertyId: string;
}
