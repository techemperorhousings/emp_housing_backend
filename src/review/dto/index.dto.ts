import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 5, description: 'Rating between 1 and 5' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Great property!', description: 'Review comment' })
  @IsNotEmpty()
  @IsString()
  comment: string;

  @ApiProperty({
    example: 'PROPERTY_ID_123',
    description: 'ID of the property being reviewed',
  })
  @IsNotEmpty()
  @IsUUID()
  propertyId: string;
}
