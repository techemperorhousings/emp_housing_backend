import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'the verification token',
    example: '1234567890',
  })
  @IsNotEmpty()
  @IsString()
  readonly token: string;

  @ApiProperty({
    description: 'the new password',
    example: 'NewPassword@123',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  readonly password: string;
}

// export class RestPasswordDTO {
//   @ApiProperty({
//     description: 'phoneNo',
//     example: '+2347016762847',
//   })
//   @IsOptional()
//   @IsString()
//   readonly phoneNo: string;

//   @ApiProperty({
//     description: 'Password',
//     example: 'password',
//   })
//   @IsNotEmpty()
//   @IsString()
//   @MaxLength(60)
//   readonly password: string;

//   @ApiProperty({
//     description: 'Confirm Password',
//     example: 'password',
//   })
//   @IsNotEmpty()
//   @IsString()
//   @MaxLength(60)
//   readonly confirm_password: string;
// }
