import { ApiProperty } from '@nestjs/swagger';
import { MaxLength, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class RestPasswordDTO {
  @ApiProperty({
    description: 'phoneNo',
    example: '+2347016762847',
  })
  @IsOptional()
  @IsString()
  readonly phoneNo: string;

  @ApiProperty({
    description: 'Password',
    example: 'password',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(60)
  readonly password: string;

  @ApiProperty({
    description: 'Confirm Password',
    example: 'password',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(60)
  readonly confirm_password: string;
}
