import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RentalAgreementService } from './rental-agreement.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationQueryDto } from '@utils/pagination.dto';
import { RentalStatus } from '@prisma/client';
import { UpdateRentalStatusDto } from './dto/index.dto';
import { AdminGuard } from '@guards/admin.guard';

@ApiTags('admin/rental-agreements')
@ApiBearerAuth('JWT-auth')
@UseGuards(AdminGuard)
@Controller('admin/rental-agreements')
export class RentalAgreementController {
  constructor(private readonly rentalService: RentalAgreementService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all rental agreements' })
  async findAll(@Query() pagination: PaginationQueryDto) {
    return this.rentalService.getAllRentals(pagination);
  }

  @Patch(':id/status/:status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update the status of a rental agreement' })
  @ApiParam({ name: 'id', required: true, description: 'Rental ID' })
  @ApiParam({
    name: 'status',
    required: true,
    description: 'New status',
    enum: RentalStatus,
  })
  async updateStatus(@Param() param: UpdateRentalStatusDto) {
    return this.rentalService.updateRentalStatus(param);
  }
}
