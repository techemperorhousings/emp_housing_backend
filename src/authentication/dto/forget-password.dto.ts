import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'the user email',
    example: 'nanret@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}

// export class ForgetPasswordDTO {
//   @IsEmail()
//   @IsOptional()
//   @IsNotEmpty()
//   readonly email: string;

//   @ApiProperty({
//     description: 'Phone Number',
//     example: '+2347016762847',
//   })
//   @IsOptional()
//   @IsString()
//   readonly phoneNo: string;

//   @ApiProperty({
//     description: 'Channel',
//     example: 'sms',
//   })
//   @IsString()
//   @IsOptional()
//   channel?: string;
// }
