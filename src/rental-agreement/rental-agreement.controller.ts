import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { RentalAgreementService } from './rental-agreement.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationQueryDto } from '@utils/pagination';
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

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all rental agreements' })
  async findAll(@Query() pagination: PaginationQueryDto) {
    const agreements =
      await this.rentalService.getAllRentalAgreements(pagination);
    return {
      message: 'Agreements fetched successfully',
      ...agreements,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new rental agreement' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRentalDto: CreateRentalAgreementDto) {
    const agreement = await this.rentalService.createRental(createRentalDto);
    return {
      message: 'Agreement created successfully',
      ...agreement,
    };
  }
  @Get('/properties/:propertyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retrieve all rental agreements for a specific property',
  })
  async findByProperty(@Param('propertyId') propertyId: string) {
    const agreements =
      await this.rentalService.getPropertyRentalAgreements(propertyId);
    return {
      message: 'Property agreements fetched successfully',
      ...agreements,
    };
  }

  @Get('/user/rentals/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retrieve all rental agreements for a specific user',
  })
  async findByUser(@Param('userId') userId: string) {
    const agreements = await this.rentalService.getUserRentalAgreements(userId);
    return {
      message: 'User agreements fetched successfully',
      ...agreements,
    };
  }

  @Get('/properties/:propertyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retrieve all rental agreements for a specific property',
  })
  async findByPropertyRentalAgreements(
    @Param('propertyId') propertyId: string,
  ) {
    const agreements =
      await this.rentalService.getPropertyRentalAgreements(propertyId);
    return {
      message: 'Property agreements fetched successfully',
      ...agreements,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get specific rental agreement details' })
  async findOne(@Param('id') id: string) {
    const agreement = await this.rentalService.getRentalAgreementById(id);
    return {
      message: 'Agreement fetched successfully',
      ...agreement,
    };
  }

  @Patch(':id/status/:status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update the status of a rental agreement' })
  @ApiParam({
    name: 'status',
    required: true,
    description: 'New status',
    enum: RentalStatus,
  })
  async updateStatus(@Param() param: UpdateRentalStatusDto) {
    const agreement = await this.rentalService.updateRentalStatus(param);
    return {
      message: 'Agreement status updated successfully',
      ...agreement,
    };
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a rental agreement' })
  async update(
    @Param('id') id: string,
    @Body() updateRentalDto: UpdateRentalAgreementDto,
  ) {
    const agreement = await this.rentalService.updateRentalAgreement(
      id,
      updateRentalDto,
    );
    return {
      message: 'Agreement updated successfully',
      ...agreement,
    };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Accept rental terms',
  })
  async acceptTermsAndConditions(@Param('id') id: string) {
    const agreement = await this.rentalService.acceptTermsAndConditions(id);
    return {
      message: 'Agreement terms accepted successfully',
      ...agreement,
    };
  }
}
