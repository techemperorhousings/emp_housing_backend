import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RentalAgreementService } from './rental-agreement.service';
import {
  CreateRentalAgreementDto,
  UpdateRentalAgreementDto,
  UpdateRentalStatusDto,
} from './dto/index.dto';
import { RentalStatus } from '@prisma/client';

@ApiTags('Rental Agreements')
@ApiBearerAuth('JWT-auth')
@Controller('rental-agreements')
export class RentalAgreementController {
  constructor(private readonly rentalService: RentalAgreementService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new rental agreement' })
  @ApiBody({ type: CreateRentalAgreementDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRentalDto: CreateRentalAgreementDto) {
    return this.rentalService.createRental(createRentalDto);
  }
  @Get('/properties/:propertyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retrieve all rental agreements for a specific property',
  })
  @ApiParam({ name: 'propertyId', description: 'Property ID' })
  async findByProperty(@Param('propertyId') propertyId: string) {
    return this.rentalService.getPropertyRentalAgreements(propertyId);
  }

  @Get('/user/renatals/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retrieve all rental agreements for a specific user',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  async findByUser(@Param('userId') userId: string) {
    return this.rentalService.getUserRentals(userId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get specific rental agreement details' })
  @ApiParam({ name: 'id', description: 'Rental Agreement ID' })
  async findOne(@Param('id') id: string) {
    return this.rentalService.getRentalById(id);
  }

  @Get('/properties/:propertyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retrieve all rental agreements for a specific property',
  })
  @ApiParam({ name: 'propertyId', description: 'Property ID' })
  async findByPropertyRentalAgreements(
    @Param('propertyId') propertyId: string,
  ) {
    return this.rentalService.getPropertyRentalAgreements(propertyId);
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

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a rental agreement' })
  @ApiParam({ name: 'id', required: true, description: 'Rental Agreement ID' })
  @ApiBody({ type: UpdateRentalAgreementDto })
  async update(
    @Param('id') id: string,
    @Body() updateRentalDto: UpdateRentalAgreementDto,
  ) {
    return this.rentalService.updateRentalAgreement(id, updateRentalDto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Accept rental terms',
  })
  @ApiParam({ name: 'id', description: 'Rental Agreement ID' })
  async acceptTermsAndConditions(@Param('id') id: string) {
    return this.rentalService.acceptTermsAndConditions(id);
  }
}
