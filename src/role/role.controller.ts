import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { RoleService } from './role.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '@decorators/index.decorator';

@ApiTags('Roles')
@Controller('role')
export class RoleController {
  constructor(private readonly service: RoleService) {}

  @Get()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Get all roles' })
  async getRoles() {
    const roles = await this.service.getAllRoles();
    return {
      message: 'Roles fetched successfully',
      ...roles,
    };
  }
}
