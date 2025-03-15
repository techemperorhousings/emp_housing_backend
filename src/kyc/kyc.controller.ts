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
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { KycService } from './kyc.service';
import { ApproveKycDto, CreateKycDto, RejectKycDto } from './dto/index.dto';

@ApiTags('KYC')
@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit KYC for verification' })
  @ApiBody({ type: CreateKycDto })
  async submitKyc(@Body() dto: CreateKycDto) {
    return this.kycService.submitKyc(dto);
  }

  @Get(':userId')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get KYC details by user ID' })
  async getKycByUser(@Param('userId') userId: string) {
    return this.kycService.getKycByUser(userId);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all KYC submissions (Admin only)' })
  async getAllKycs() {
    return this.kycService.getAllKycs();
  }

  @Patch(':id/approve')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a KYC request' })
  async approve(@Body() dto: ApproveKycDto) {
    return this.kycService.approveKyc(dto);
  }

  @Patch(':id/reject')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a KYC request and provide a reason' })
  async reject(@Body() dto: RejectKycDto) {
    return this.kycService.rejectKyc(dto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete KYC record' })
  async deleteKyc(@Param('id') id: string) {
    return this.kycService.deleteKyc(id);
  }
}
