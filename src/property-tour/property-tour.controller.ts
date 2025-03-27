import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { PropertyTourService } from './property-tour.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  AddFeedbackDto,
  CreatePropertyTourDto,
  UpdateTourStatusDto,
} from './dto/index.dto';

@ApiTags('Property Tours')
@ApiBearerAuth('JWT-auth')
@Controller('tours')
export class PropertyTourController {
  constructor(private readonly service: PropertyTourService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Request a property tour' })
  @ApiBody({ type: CreatePropertyTourDto })
  async createTour(@Body() dto: CreatePropertyTourDto) {
    return this.service.createTour(dto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a tour request (Only if Pending)' })
  @HttpCode(HttpStatus.OK)
  async cancelTour(@Param('id') id: string) {
    return this.service.cancelTour(id);
  }

  @Patch(':id/feedback')
  @ApiOperation({ summary: 'Submit feedback for a tour' })
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: AddFeedbackDto })
  async submitFeedback(
    @Param('id') id: string,
    @Body('feedback') feedback: string,
  ) {
    return this.service.submitFeedback(id, feedback);
  }

  @Get('agent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all agent tours' })
  async getAgentTours(@Req() req) {
    return this.service.getAgentTours(req.user.id);
  }

  @Patch(':id/status/:status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update tour status' })
  async updateStatus(@Param() param: UpdateTourStatusDto) {
    const { status, id } = param;
    return this.service.updateTourStatus(id, status);
  }

  @Get('property/:propertyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all tours for a specific property' })
  async getToursByProperty(@Param('propertyId') propertyId: string) {
    return this.service.getToursByProperty(propertyId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get specific tour details' })
  async getTourById(@Param('id') id: string) {
    return this.service.getTourById(id);
  }
}
