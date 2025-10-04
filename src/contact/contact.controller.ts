import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { CreateContactInquiryDto } from './dtos/create-inquiry.dto';
import { QueryContactInquiryDto } from './dtos/query-inquiry.dto';
import { UpdateContactInquiryDto } from './dtos/update-inquiry.dto';
import { Public } from '@decorators/index.decorator';

@ApiTags('Contact Inquiries')
@Controller('inquiries')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create a new contact inquiry' })
  @ApiResponse({ status: 201, description: 'Inquiry created successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Too many inquiries or invalid data.',
  })
  create(@Body() dto: CreateContactInquiryDto) {
    return this.contactService.create(dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all inquiries with filters and pagination' })
  findAll(@Query() query: QueryContactInquiryDto) {
    return this.contactService.findAll(query);
  }

  @Patch(':id/status')
  @Public()
  @ApiOperation({ summary: 'Update inquiry status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully.' })
  updateStatus(@Param('id') id: string, @Query() dto: UpdateContactInquiryDto) {
    return this.contactService.updateStatus(id, dto);
  }

  @Delete(':id')
  @Public()
  @ApiOperation({ summary: 'Delete an inquiry' })
  @ApiResponse({ status: 200, description: 'Inquiry deleted successfully.' })
  remove(@Param('id') id: string) {
    return this.contactService.remove(id);
  }

  @Get('stats/summary')
  @Public()
  @ApiOperation({
    summary: 'Get inquiry statistics (counts by type and status)',
  })
  getStats() {
    return this.contactService.getStats();
  }

  @Get('recent')
  @Public()
  @ApiOperation({ summary: 'Get recent inquiries from the last 7 days' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getRecent(@Query('limit') limit?: number) {
    return this.contactService.getRecent(limit);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a single inquiry by ID' })
  @ApiResponse({ status: 404, description: 'Inquiry not found.' })
  findOne(@Param('id') id: string) {
    return this.contactService.findOne(id);
  }
}
