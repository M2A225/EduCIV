import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionGuard)
@Roles('DIRECTOR', 'BACKOFFICE')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() body: CreateUserDto) {
    const user = await this.usersService.create(body);
    return { success: true, data: user, error: null };
  }

  @Get()
  async list(@Query() q: PaginationDto) {
    const users = await this.usersService.list(q.page, q.pageSize);
    return { success: true, data: users, error: null };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const u = await this.usersService.findById(Number(id));
    return { success: true, data: u, error: null };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const u = await this.usersService.update(Number(id), body);
    return { success: true, data: u, error: null };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.remove(Number(id));
    return { success: true, data: null, error: null };
  }
}
