import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthValidateOtpDto {
  @ApiProperty({
    description: 'Phone Number',
    example: '+2347016762847',
  })
  @IsString()
  @IsNotEmpty()
  phoneNo: string;

  @ApiProperty({
    description: 'Code',
    example: '12346',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Reference id',
    example: 'W762YHG3773V377V3GHB ',
  })
  @IsString()
  @IsNotEmpty()
  reference_id: string;
}
