import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RentalService } from './rental.service';
import {
  CreateRentalAgreementDto,
  UpdateRentalStatusDto,
} from './dto/index.dto';
import { RentalStatus } from '@prisma/client';

@ApiTags('Rentals')
@Controller('rentals')
export class RentalController {
  constructor(private readonly rentalService: RentalService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new rental agreement (Tenant applies)' })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({ type: CreateRentalAgreementDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRentalDto: CreateRentalAgreementDto) {
    return this.rentalService.createRental(createRentalDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve all rental agreements' })
  @ApiBearerAuth('JWT-auth')
  async findAll() {
    return this.rentalService.getAllRentals();
  }

  @Get('/user/renatals/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Retrieve all rental agreements for a specific user',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  async findByUser(@Param('userId') userId: string) {
    return this.rentalService.getUserRentals(userId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a single rental agreement by ID' })
  @ApiParam({ name: 'id', description: 'Rental ID' })
  @ApiBearerAuth('JWT-auth')
  async findOne(@Param('id') id: string) {
    return this.rentalService.getRentalById(id);
  }

  @Put(':id/status/:status')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
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

  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a rental agreement' })
  async delete(@Param('id') id: string) {
    return this.rentalService.deleteRental(id);
  }
}
