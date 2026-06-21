import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ParentsService } from './parents.service';
import { LinkParentDto } from './dto/link-parent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { getCurrentSchoolId } from '../common/school-context';
import type { RequestWithUser } from '../auth/types';

@Controller('parents')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('link')
  async linkParent(@Body() body: LinkParentDto, @Req() req: RequestWithUser) {
    const school_id = getCurrentSchoolId(req);
    const result = await this.parentsService.linkParent(body, school_id);
    return { success: true, data: result, error: null };
  }

  @Get('student/:studentId')
  async getStudentParents(
    @Param('studentId') studentId: string,
    @Req() req: RequestWithUser,
  ) {
    const school_id = getCurrentSchoolId(req);
    const result = await this.parentsService.getStudentParents(
      Number(studentId),
      school_id,
    );
    return { success: true, data: result, error: null };
  }

  @Get('parent/:parentUserId')
  async getParentStudents(
    @Param('parentUserId') parentUserId: string,
    @Req() req: RequestWithUser,
  ) {
    const school_id = getCurrentSchoolId(req);
    const result = await this.parentsService.getParentStudents(
      Number(parentUserId),
      school_id,
    );
    return { success: true, data: result, error: null };
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('unlink/:studentId/:parentUserId')
  async unlinkParent(
    @Param('studentId') studentId: string,
    @Param('parentUserId') parentUserId: string,
    @Req() req: RequestWithUser,
  ) {
    const school_id = getCurrentSchoolId(req);
    await this.parentsService.unlinkParent(
      Number(studentId),
      Number(parentUserId),
      school_id,
    );
    return { success: true, data: null, error: null };
  }
}
