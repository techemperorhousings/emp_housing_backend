import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AddAccountDto {
  @ApiProperty({
    description: 'Account number',
    example: '1234567890',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  accountNumber: string;

  @ApiProperty({
    description: 'Account name',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  accountName: string;

  @ApiProperty({
    description: 'Bank name',
    example: 'Access Bank',
  })
  @IsNotEmpty()
  @IsString()
  bankName: string;
}
