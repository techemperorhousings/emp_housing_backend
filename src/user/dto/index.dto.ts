import { AuthDto } from '@authentication/dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateUserDto extends PartialType(AuthDto) {}
