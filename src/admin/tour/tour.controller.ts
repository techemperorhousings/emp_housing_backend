import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TourService } from './tour.service';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiTags,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AdminGuard } from '@guards/admin.guard';
import {
  AssignAgentDto,
  FilterDto,
  UpdateTourStatusDto,
} from './dto/index.dto';

@ApiTags('admin/tours')
@ApiBearerAuth('JWT-auth')
@UseGuards(AdminGuard)
@Controller('admin/tours')
export class TourController {
  constructor(private readonly service: TourService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all property tours with status filtering',
  })
  @HttpCode(HttpStatus.OK)
  async getAllTours(@Query() query: FilterDto) {
    return this.service.getAllTours(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a single tour details',
  })
  @ApiParam({
    name: 'id',
    description: 'Tour ID',
    type: 'string',
    required: true,
  })
  async getTourById(@Param('id') tourId: string) {
    return this.service.getTourById(tourId);
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
    return this.service.assignTourToAgent(tourId, agentId);
  }

  @Patch(':id/status/:status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update tour status' })
  async updateStatus(@Param() param: UpdateTourStatusDto) {
    const { status, id } = param;
    return this.service.updateTourStatus(id, status);
  }
}
