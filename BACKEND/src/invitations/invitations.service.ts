import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class InvitationsService {
  constructor(private readonly prisma: PrismaService) {}

  async generateParentCode(
    studentIds: number[],
    schoolId: number,
    createdBy: number,
  ) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = crypto
      .randomBytes(3)
      .toString('hex')
      .toUpperCase()
      .slice(0, 6);
    const code = `EDU-${date}-${random}`;

    await this.prisma.invitation.create({
      data: {
        code,
        target_type: 'PARENT',
        target_ids: JSON.stringify(studentIds),
        school_id: schoolId,
        created_by: createdBy,
      },
    });

    return code;
  }

  async generateTeacherToken(
    teacherId: number,
    schoolId: number,
    createdBy: number,
  ) {
    const token = crypto.randomUUID();
    const code = crypto.randomUUID().slice(0, 12);

    await this.prisma.invitation.create({
      data: {
        code,
        token,
        target_type: 'TEACHER',
        target_ids: JSON.stringify([teacherId]),
        school_id: schoolId,
        created_by: createdBy,
      },
    });

    return {
      token,
      registrationLink: `${process.env.FRONTEND_URL || ''}/auth/register?token=${token}`,
    };
  }

  async verifyInvitation(codeOrToken: string) {
    const invitation = await this.prisma.invitation.findFirst({
      where: {
        OR: [{ code: codeOrToken }, { token: codeOrToken }],
      },
    });

    if (!invitation) {
      return {
        valid: false,
        target_type: null,
        target_ids: null,
        school_id: null,
        has_account: false,
      };
    }

    const isExpired =
      invitation.expires_at && invitation.expires_at < new Date();
    const isExhausted = invitation.current_uses >= invitation.max_uses;

    return {
      valid: !isExpired && !isExhausted,
      target_type: invitation.target_type,
      target_ids: JSON.parse(invitation.target_ids) as number[],
      school_id: invitation.school_id,
      has_account: false,
    };
  }

  async useInvitation(codeOrToken: string) {
    await this.prisma.invitation.updateMany({
      where: {
        OR: [{ code: codeOrToken }, { token: codeOrToken }],
      },
      data: { current_uses: { increment: 1 } },
    });
  }
}
