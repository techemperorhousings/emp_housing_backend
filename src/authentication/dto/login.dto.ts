import { ApiProperty } from '@nestjs/swagger';
import {
  MaxLength,
  IsNotEmpty,
  IsEmail,
  IsString,
  IsOptional,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'email',
    example: 'Arowosegbe67@gmail.com',
  })
  // @ApiProperty({
  //   description: 'Email',
  //   example: 'trofira_admin@gmail.com',
  // })
  @IsEmail()
  @IsOptional()
  @IsNotEmpty()
  readonly email: string;

  @IsOptional()
  @IsString()
  readonly phoneNo: string;

  // @ApiProperty({
  //   description: 'Vendor Password',
  //   example: 'password',
  // })
  @ApiProperty({
    description: 'Password',
    example: '_Password@1',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(60)
  readonly password: string;
}
//
export class MagicLinkDto {
  @ApiProperty({
    description: 'Email',
    example: 'Arowosegbe67@gmail.com',
  })
  @IsEmail()
  @IsOptional()
  @IsNotEmpty()
  readonly email: string;
}
