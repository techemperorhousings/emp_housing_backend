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
} from '@nestjs/common';
import { PropertyTourService } from './property-tour.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  AddFeedbackDto,
  AssignAgentDto,
  CreatePropertyTourDto,
  FilterDto,
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
    const tour = await this.service.createTour(dto);
    return {
      message: 'Property tour requested successfully',
      ...tour,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all property tours with status filtering',
  })
  @HttpCode(HttpStatus.OK)
  async getAllTours(@Query() query: FilterDto) {
    const tours = await this.service.getAllTours(query);
    return {
      message: 'Property tours fetched successfully',
      ...tours,
    };
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a tour request (Only if Pending)' })
  @HttpCode(HttpStatus.OK)
  async cancelTour(@Param('id') id: string) {
    const tour = await this.service.cancelTour(id);
    return {
      message: 'Tour cancelled successfully',
      ...tour,
    };
  }

  @Patch(':id/feedback')
  @ApiOperation({ summary: 'Submit feedback for a tour' })
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: AddFeedbackDto })
  async submitFeedback(
    @Param('id') id: string,
    @Body('feedback') feedback: string,
  ) {
    const tour = await this.service.submitFeedback(id, feedback);
    return {
      message: 'Feedback submitted successfully',
      ...tour,
    };
  }

  @Get('agent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all agent tours' })
  async getAgentTours(@Req() req) {
    const tours = await this.service.getAgentTours(req.user.id);
    return {
      message: 'Agent tours fetched successfully',
      ...tours,
    };
  }

  @Patch(':id/status/:status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update tour status' })
  async updateStatus(@Param() param: UpdateTourStatusDto) {
    const { status, id } = param;
    const tour = await this.service.updateTourStatus(id, status);
    return {
      message: 'Tour status updated successfully',
      ...tour,
    };
  }

  @Patch(':id/assign-agent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Assign a tour to an agent',
  })
  @ApiBody({
    type: AssignAgentDto,
  })
  async assignTourToAgent(
    @Param('id') tourId: string,
    @Body('agentId') agentId: string,
  ) {
    const tour = await this.service.assignTourToAgent(tourId, agentId);
    return {
      message: 'Tour assigned successfully',
      ...tour,
    };
  }

  @Get('property/:propertyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all tours for a specific property' })
  async getToursByProperty(@Param('propertyId') propertyId: string) {
    const tours = await this.service.getToursByProperty(propertyId);
    return {
      message: 'Property tours fetched successfully',
      ...tours,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get specific tour details' })
  async getTourById(@Param('id') id: string) {
    const tour = await this.service.getTourById(id);
    return {
      message: 'Tour fetched successfully',
      ...tour,
    };
  }
}
