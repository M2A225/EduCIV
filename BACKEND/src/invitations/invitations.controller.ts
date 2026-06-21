import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { GenerateInvitationDto } from './dto/generate-invitation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SchoolContextGuard } from '../auth/guards/school-context.guard';
import { RequestWithUser } from '../auth/types';

@Controller('invitations')
@UseGuards(JwtAuthGuard, SchoolContextGuard)
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('generate')
  async generate(
    @Body() body: GenerateInvitationDto,
    @Req() req: RequestWithUser,
  ) {
    const code = await this.invitationsService.generateParentCode(
      body.student_ids,
      req.user.currentSchoolId,
      req.user.userId,
    );
    return { success: true, data: { code }, error: null };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('generate-teacher')
  async generateTeacher(@Req() req: RequestWithUser) {
    const result = await this.invitationsService.generateTeacherToken(
      req.user.userId,
      req.user.currentSchoolId,
      req.user.userId,
    );
    return { success: true, data: result, error: null };
  }
}
