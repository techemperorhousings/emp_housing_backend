import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { KycService } from './kyc.service';
import { AdminGuard } from '@guards/admin.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { GetKycQueryDto, RejectKycDto } from './dto/index.dto';

@ApiTags('admin/kyc')
@ApiBearerAuth('JWT-auth')
@UseGuards(AdminGuard)
@Controller('admin/kyc')
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Get()
  @ApiOperation({ summary: 'Get all KYC submissions with pagination' })
  async getAllKyc(@Query() query: GetKycQueryDto) {
    return this.kycService.getAllKyc(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific KYC submission by ID' })
  @ApiParam({ name: 'id', description: 'KYC submission ID' })
  @ApiResponse({
    status: 200,
    description: 'KYC submission retrieved successfully',
  })
  async getKycById(@Param('id') id: string) {
    return this.kycService.getKycById(id);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve KYC submission' })
  @ApiParam({ name: 'id', description: 'KYC submission ID' })
  @ApiResponse({
    status: 200,
    description: 'KYC submission approved successfully',
  })
  async approveKyc(@Param('id') id: string, @Req() req) {
    return this.kycService.approveKyc(id, req.user.id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject KYC submission with reason' })
  @ApiParam({ name: 'id', description: 'KYC submission ID' })
  @ApiResponse({
    status: 200,
    description: 'KYC submission rejected successfully',
  })
  async rejectKyc(
    @Param('id') id: string,
    @Req() req,
    @Body() rejectKycDto: RejectKycDto,
  ) {
    return this.kycService.rejectKyc(id, req.user.id, rejectKycDto.reason);
  }
}
