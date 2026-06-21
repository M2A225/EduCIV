import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Patch,
  Delete,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SchoolsService } from './schools.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SchoolContextGuard } from '../auth/guards/school-context.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { getCurrentSchoolId } from '../common/school-context';
import { RequestWithUser } from '../auth/types';

@Controller('schools')
@UseGuards(JwtAuthGuard)
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() body: CreateSchoolDto) {
    const s = await this.schoolsService.createSchool(body);
    return { success: true, data: s, error: null };
  }

  @Get('setup-status')
  async getSetupStatus(@Req() req: RequestWithUser) {
    const schoolId = getCurrentSchoolId(req);
    const data = await this.schoolsService.getSetupStatus(
      schoolId,
      req.user.role,
    );
    return { success: true, data, error: null };
  }

  @Get('levels/defaults')
  async getDefaultLevels(
    @Req() req: RequestWithUser,
    @Query('school_type') schoolType: string,
  ) {
    const schoolId = getCurrentSchoolId(req);
    const school = await this.schoolsService.getSchoolById(schoolId);
    const data = await this.schoolsService.getDefaultLevels(
      schoolType || school?.school_type || '',
    );
    return { success: true, data, error: null };
  }

  @Get('levels')
  async getLevels(@Req() req: RequestWithUser) {
    const schoolId = getCurrentSchoolId(req);
    const data = await this.schoolsService.getLevels(schoolId);
    return { success: true, data, error: null };
  }

  @Put('levels')
  @UseGuards(SchoolContextGuard, PermissionGuard)
  @Roles('DIRECTOR')
  async updateLevels(@Req() req: RequestWithUser, @Body() body: { levels: string[] }) {
    const data = await this.schoolsService.updateLevels(
      req.user.currentSchoolId,
      body.levels,
    );
    return { success: true, data, error: null };
  }

  @Get('level-tuitions')
  async getLevelTuitions(@Req() req: RequestWithUser) {
    const schoolId = getCurrentSchoolId(req);
    const data = await this.schoolsService.getLevelTuitions(schoolId);
    return { success: true, data, error: null };
  }

  @Put('level-tuitions')
  @UseGuards(SchoolContextGuard, PermissionGuard)
  @Roles('ACCOUNTANT')
  async upsertLevelTuitions(
    @Req() req: RequestWithUser,
    @Body() body: { tuitions: { level: string; amount: number }[] },
  ) {
    const data = await this.schoolsService.upsertLevelTuitions(
      req.user.currentSchoolId,
      body.tuitions,
    );
    return { success: true, data, error: null };
  }

  @Post('complete-setup')
  async completeSetup(@Req() req: RequestWithUser) {
    const schoolId = getCurrentSchoolId(req);
    const data = await this.schoolsService.completeSetup(
      schoolId,
      req.user.role,
    );
    return { success: true, data, error: null };
  }

  @Post(':id/reset-setup')
  @UseGuards(SchoolContextGuard, PermissionGuard)
  @Roles('BACKOFFICE')
  async resetSetup(@Param('id') id: string) {
    const data = await this.schoolsService.resetSetup(Number(id));
    return { success: true, data, error: null };
  }

  @Get('me')
  async getMySchool(@Req() req: RequestWithUser) {
    const schoolId = getCurrentSchoolId(req);
    const s = await this.schoolsService.getSchoolById(schoolId);
    return { success: true, data: s, error: null };
  }

  @Get('stats')
  async getStats(@Req() req: RequestWithUser, @Query('school_id') school_id?: string) {
    const schoolId = school_id ? Number(school_id) : getCurrentSchoolId(req);
    const s = await this.schoolsService.getStats(schoolId);
    return { success: true, data: s, error: null };
  }

  @Get()
  async list(@Query() q: PaginationDto) {
    const schools = await this.schoolsService.listAll(q.page, q.pageSize);
    return { success: true, data: schools, error: null };
  }

  @Patch('me')
  async updateMySchool(@Req() req: RequestWithUser, @Body() body: UpdateSchoolDto) {
    const schoolId = getCurrentSchoolId(req);
    const s = await this.schoolsService.updateSchool(schoolId, body);
    return { success: true, data: s, error: null };
  }

  @Patch(':id')
  async updateById(@Param('id') id: string, @Body() body: UpdateSchoolDto) {
    const s = await this.schoolsService.updateSchool(Number(id), body);
    return { success: true, data: s, error: null };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.schoolsService.deleteSchool(Number(id));
    return { success: true, data: null, error: null };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('logo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(@Req() req: RequestWithUser, @UploadedFile() file: Express.Multer.File) {
    const schoolId = getCurrentSchoolId(req);
    const s = await this.schoolsService.uploadSchoolLogo(schoolId, file);
    return { success: true, data: s, error: null };
  }

  @Get('filieres')
  @UseGuards(SchoolContextGuard, PermissionGuard)
  @Roles('DIRECTOR')
  async getFilieres(@Req() req: RequestWithUser) {
    const data = await this.schoolsService.getFilieres(
      req.user.currentSchoolId,
    );
    return { success: true, data, error: null };
  }

  @Put('filieres')
  @UseGuards(SchoolContextGuard, PermissionGuard)
  @Roles('DIRECTOR')
  async updateFilieres(@Req() req: RequestWithUser, @Body() body: { filieres: string[] }) {
    const data = await this.schoolsService.updateFilieres(
      req.user.currentSchoolId,
      body.filieres,
    );
    return { success: true, data, error: null };
  }

  @Get('group/:schoolId')
  async getSchoolGroup(@Param('schoolId') schoolId: string) {
    const data = await this.schoolsService.getSchoolGroup(Number(schoolId));
    return { success: true, data, error: null };
  }

  @Get(':idOrSlug')
  async getOne(@Param('idOrSlug') idOrSlug: string) {
    const id = Number(idOrSlug);
    const s = isNaN(id) ? null : await this.schoolsService.getSchoolById(id);
    if (s) return { success: true, data: s, error: null };
    const bySlug = await this.schoolsService.getSchoolBySchoolId(
      Number(idOrSlug),
    );
    return { success: true, data: bySlug, error: null };
  }
}
