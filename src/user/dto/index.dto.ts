import { AuthDto } from '@authentication/dto';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateUserStatusDto {
  @ApiProperty({
    description: 'Whether the user is active',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;
}

export class UpdateUserRoleDto {
  @ApiProperty({
    description: 'Role Id of the user',
    example: '1234567890abcdef12345678',
  })
  @IsNotEmpty()
  role: string;
}

export class UpdateUserDto extends PartialType(AuthDto) {}
