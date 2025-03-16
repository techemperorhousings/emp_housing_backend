import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { KycService } from './kyc.service';
import { CreateKycDto } from './dto/index.dto';

@ApiTags('KYC')
@ApiBearerAuth('JWT-auth')
@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit KYC for verification' })
  @ApiBody({ type: CreateKycDto })
  async submitKyc(@Body() dto: CreateKycDto, @Req() req) {
    return this.kycService.submitKyc(dto, req.user.id);
  }

  @Get('status')
  @ApiOperation({ summary: 'Check own KYC status' })
  @ApiResponse({
    status: 200,
    description: 'KYC status retrieved successfully',
  })
  async getKycStatus(@Req() req) {
    return this.kycService.getKycStatus(req.user.id);
  }
}
