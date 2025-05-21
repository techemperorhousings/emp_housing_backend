import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { KycService } from './kyc.service';
import { CreateKycDto, GetKycQueryDto, RejectKycDto } from './dto/index.dto';
import { AdminGuard } from '@guards/admin.guard';

@ApiTags('KYC')
@ApiBearerAuth('JWT-auth')
@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit KYC for verification' })
  async submitKyc(@Body() dto: CreateKycDto, @Req() req) {
    const kyc = await this.kycService.submitKyc(dto, req.user.id);
    return {
      message: 'kYC submitted successfully',
      ...kyc,
    };
  }

  @Get('status')
  @ApiOperation({ summary: 'Check own KYC status' })
  @ApiResponse({
    status: 200,
    description: 'KYC status retrieved successfully',
  })
  async getKycStatus(@Req() req) {
    const status = await this.kycService.getKycStatus(req.user.id);
    return {
      message: 'KYC status fetched successfully',
      ...status,
    };
  }

  /***************Admin Routes ************/
  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get all KYC submissions with pagination' })
  async getAllKyc(@Query() query: GetKycQueryDto) {
    const kycs = await this.kycService.getAllKyc(query);
    return {
      message: 'KYC submissions fetched successfully',
      ...kycs,
    };
  }

  @Get('/user/:userId')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Get specific KYC submission by user ID' })
  @ApiResponse({
    status: 200,
    description: 'KYC submission retrieved successfully',
  })
  async getKycById(@Param('userId') id: string) {
    const kyc = await this.kycService.getKycById(id);
    return {
      message: 'KYC fetched successfully',
      ...kyc,
    };
  }

  @Patch(':id/approve')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Approve KYC submission' })
  @ApiResponse({
    status: 200,
    description: 'KYC submission approved successfully',
  })
  async approveKyc(@Param('id') id: string, @Req() req) {
    const kyc = await this.kycService.approveKyc(id, req.user.id);
    return {
      message: 'KYC approved successfully',
      ...kyc,
    };
  }

  @Patch(':id/reject')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Reject KYC submission with reason' })
  @ApiResponse({
    status: 200,
    description: 'KYC submission rejected successfully',
  })
  async rejectKyc(
    @Param('id') id: string,
    @Req() req,
    @Body() rejectKycDto: RejectKycDto,
  ) {
    const kyc = await this.kycService.rejectKyc(
      id,
      req.user.id,
      rejectKycDto.reason,
    );
    return {
      message: 'KYC rejected',
      ...kyc,
    };
  }
}
