import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { BankAccountService } from './bank-account.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AddAccountDto } from './dto/add-account.dto';
import { UpdateAccountDto } from './dto/UpdateAccountDto';

@ApiTags('Bank Account')
@ApiBearerAuth('JWT-auth')
@Controller('bank-account')
export class BankAccountController {
  constructor(private readonly service: BankAccountService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add account' })
  async addAccount(@Body() dto: AddAccountDto, @Req() req) {
    const account = await this.service.create(req.user.id, dto);
    return {
      message: 'Account added successfully',
      ...account,
    };
  }

  @Get('/user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all accounts for a user' })
  async getUserAccounts(@Param('userId') userId: string) {
    const accounts = await this.service.getAllBankAccounts(userId);
    return {
      message: 'Accounts fetched successfully',
      ...accounts,
    };
  }

  @Get(':id/user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get one account by ID' })
  async getAccount(@Param('id') id: string, @Param('userId') userId: string) {
    const account = await this.service.findOne(id, userId);
    return {
      message: 'Account fetched successfully',
      ...account,
    };
  }

  @Patch(':id/user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update account' })
  async updateAccount(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateAccountDto,
  ) {
    const updated = await this.service.update(id, userId, dto);
    return {
      message: 'Account updated successfully',
      ...updated,
    };
  }

  @Delete(':id/user/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete account' })
  async deleteAccount(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    await this.service.remove(id, userId);
  }
}
