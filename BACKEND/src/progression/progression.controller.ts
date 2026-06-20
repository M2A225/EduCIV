import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProgressionService } from './progression.service';
import { VoteDto } from './dto/vote.dto';
import { DecideDto } from './dto/decide.dto';
import { ApplyDto } from './dto/apply.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SchoolContextGuard } from '../auth/guards/school-context.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { DecisionVote, DecisionFinale } from '@prisma/client';

@Controller('progression')
@UseGuards(JwtAuthGuard, SchoolContextGuard, PermissionGuard)
export class ProgressionController {
  constructor(private readonly progressionService: ProgressionService) {}

  @Get('class/:classId/year/:yearId')
  @Roles('DIRECTOR', 'TEACHER')
  async getClassStudents(
    @Param('classId') classId: string,
    @Param('yearId') yearId: string,
    @Req() req: any,
  ) {
    const data = await this.progressionService.getClassStudents(
      Number(classId),
      Number(yearId),
      req.user.currentSchoolId,
    );
    return { success: true, data, error: null };
  }

  @Get('votes/class/:classId/year/:yearId')
  @Roles('DIRECTOR', 'TEACHER')
  async getClassVotes(
    @Param('classId') classId: string,
    @Param('yearId') yearId: string,
    @Req() req: any,
  ) {
    const data = await this.progressionService.getClassVotes(
      Number(classId),
      Number(yearId),
      req.user.currentSchoolId,
    );
    return { success: true, data, error: null };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('vote')
  @Roles('TEACHER')
  async vote(@Body() body: VoteDto, @Req() req: any) {
    const yearId = await this.progressionService.getCurrentYearId(
      req.user.currentSchoolId,
    );
    const classId = await this.progressionService.getStudentClass(
      body.student_id,
    );
    const data = await this.progressionService.vote(
      body.student_id,
      req.user.userId,
      classId!,
      yearId,
      req.user.currentSchoolId,
      body.decision as DecisionVote,
      body.comment,
    );
    return { success: true, data, error: null };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('decide')
  @Roles('DIRECTOR')
  async decide(@Body() body: DecideDto, @Req() req: any) {
    const yearId = await this.progressionService.getCurrentYearId(
      req.user.currentSchoolId,
    );
    const data = await this.progressionService.decide(
      body.student_id,
      yearId,
      req.user.currentSchoolId,
      body.final_decision as DecisionFinale,
      body.next_class_id,
      body.comment,
    );
    return { success: true, data, error: null };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('apply')
  @Roles('DIRECTOR')
  async apply(@Body() body: ApplyDto, @Req() req: any) {
    const data = await this.progressionService.apply(
      body.school_year_id,
      req.user.currentSchoolId,
    );
    return { success: true, data, error: null };
  }

  @Get('options/:classId')
  @Roles('DIRECTOR', 'TEACHER')
  async getOptions(@Param('classId') classId: string, @Req() req: any) {
    const data = await this.progressionService.getProgressionOptions(
      Number(classId),
      req.user.currentSchoolId,
    );
    return { success: true, data, error: null };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('archive/:schoolYearId')
  @Roles('DIRECTOR')
  async archive(@Param('schoolYearId') schoolYearId: string, @Req() req: any) {
    const data = await this.progressionService.archiveYear(
      Number(schoolYearId),
      req.user.currentSchoolId,
      req.user.userId,
    );
    return { success: true, data, error: null };
  }

  @Get('stats/:schoolYearId')
  @Roles('DIRECTOR')
  async stats(@Param('schoolYearId') schoolYearId: string, @Req() req: any) {
    const data = await this.progressionService.getYearStats(
      Number(schoolYearId),
      req.user.currentSchoolId,
    );
    return { success: true, data, error: null };
  }

  @Get('financial/:schoolYearId')
  @Roles('DIRECTOR', 'ACCOUNTANT')
  async financial(
    @Param('schoolYearId') schoolYearId: string,
    @Req() req: any,
  ) {
    const data = await this.progressionService.getFinancialClose(
      Number(schoolYearId),
      req.user.currentSchoolId,
    );
    return { success: true, data, error: null };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('create-next-year')
  @Roles('DIRECTOR')
  async createNextYear(@Req() req: any) {
    const data = await this.progressionService.createNextYear(
      req.user.currentSchoolId,
    );
    return { success: true, data, error: null };
  }
}
