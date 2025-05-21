import { PartialType } from '@nestjs/mapped-types';
import { AddAccountDto } from './add-account.dto';

export class UpdateAccountDto extends PartialType(AddAccountDto) {}
