import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  Inject,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JsonWebTokenError } from 'jsonwebtoken';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RefreshTokenRepository } from './refresh-token.repository';
import { PrismaService } from '../core/prisma.service';
import { InvitationsService } from '../invitations/invitations.service';
import { RegisterWithInvitationDto } from './dto/register-with-invitation.dto';
import * as bcrypt from 'bcryptjs';
import { REDIS_CLIENT } from '../common/redis.provider';
import { Redis } from '@upstash/redis';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  user?: any;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly refreshRepo: RefreshTokenRepository,
    private readonly prisma: PrismaService,
    private readonly invitationsService: InvitationsService,
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  private getRefreshTTLMs() {
    const v = process.env.REFRESH_EXPIRES || '7d';
    if (v.endsWith('d')) {
      const days = parseInt(v.slice(0, -1), 10) || 7;
      return days * 24 * 60 * 60 * 1000;
    }
    return 7 * 24 * 60 * 60 * 1000;
  }

  private localAttempts = new Map<
    string,
    { count: number; expiresAt: number }
  >();
  private localBlocks = new Map<string, number>();

  private async safeGetBlock(key: string): Promise<boolean> {
    try {
      const isBlocked = await this.redis.get<string>(key);
      return !!isBlocked;
    } catch (e) {
      this.logger.warn(
        'Redis connection failed on get block, falling back to memory: ' +
          (e as Error).message,
      );
      const expiresAt = this.localBlocks.get(key);
      if (expiresAt && expiresAt > Date.now()) {
        return true;
      }
      if (expiresAt) this.localBlocks.delete(key);
      return false;
    }
  }

  private get attemptTTLSec(): number {
    return parseInt(process.env.REDIS_ATTEMPT_TTL || '900', 10);
  }

  private get attemptThreshold(): number {
    return parseInt(process.env.REDIS_ATTEMPT_THRESHOLD || '5', 10);
  }

  private async safeIncrementAttempt(
    key: string,
    blockKey: string,
  ): Promise<number> {
    try {
      const attempts = await this.redis.incr(key);
      const ttl = this.attemptTTLSec;
      if (attempts === 1) await this.redis.expire(key, ttl);
      if (attempts >= this.attemptThreshold) {
        await Promise.all([
          this.redis.set(blockKey, '1', { ex: ttl }),
          this.redis.del(key),
        ]);
      }
      return attempts;
    } catch (e) {
      this.logger.warn(
        'Redis connection failed on increment attempts, falling back to memory: ' +
          (e as Error).message,
      );
      const now = Date.now();
      const ttlMs = this.attemptTTLSec * 1000;
      const current = this.localAttempts.get(key) || {
        count: 0,
        expiresAt: now + ttlMs,
      };
      if (current.expiresAt <= now) {
        current.count = 0;
        current.expiresAt = now + ttlMs;
      }
      current.count += 1;
      this.localAttempts.set(key, current);

      if (current.count >= this.attemptThreshold) {
        this.localBlocks.set(blockKey, now + ttlMs);
        this.localAttempts.delete(key);
      }
      return current.count;
    }
  }

  private async safeClearAttempts(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (e) {
      this.logger.warn(
        'Redis connection failed on clear attempts, falling back to memory: ' +
          (e as Error).message,
      );
      this.localAttempts.delete(key);
    }
  }

  async getProfile(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const userSchools = await this.prisma.userSchool.findMany({
      where: { user_id: userId },
    });
    const schoolIds = [...new Set(userSchools.map((us) => us.school_id))];
    const roleMap = new Map<string, string>();
    for (const us of userSchools) {
      roleMap.set(us.role, us.scope);
    }
    const availableRoles = [...roleMap.keys()];
    const scopeByRole = Object.fromEntries(roleMap);
    const activeRole = availableRoles.includes(user.role)
      ? user.role
      : availableRoles[0];

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar_url: user.avatar_url,
      role: activeRole,
      roles: availableRoles,
      school_ids: schoolIds,
      primary_school_id: user.school_id || schoolIds[0] || null,
      scope_by_role: scopeByRole,
    };
  }

  async login(identifier: string, password: string): Promise<Tokens> {
    const blockKey = `educiv:auth:block:${identifier}`;
    const attemptKey = `educiv:auth:attempts:${identifier}`;

    const isBlocked = await this.safeGetBlock(blockKey);
    if (isBlocked)
      throw new ForbiddenException(
        'Compte temporairement bloqué. Réessayez dans 15 minutes.',
      );

    const user = await this.usersService.findByIdentifier(identifier);
    if (!user) {
      await this.safeIncrementAttempt(attemptKey, blockKey);
      throw new UnauthorizedException(
        'Aucun compte trouvé avec cet identifiant',
      );
    }

    const valid = await this.usersService.verifyPassword(user, password);
    if (!valid) {
      await this.safeIncrementAttempt(attemptKey, blockKey);
      throw new UnauthorizedException('Mot de passe incorrect');
    }

    await this.safeClearAttempts(attemptKey);

    let schoolIds: number[];
    let availableRoles: string[] = [user.role];
    let scopeByRole: Record<string, string> = { [user.role]: 'SCHOOL' };
    if (user.role === 'BACKOFFICE') {
      const allSchools = await this.prisma.school.findMany({
        select: { id: true },
      });
      schoolIds = allSchools.map((s) => s.id);
    } else {
      const userSchools = await this.prisma.userSchool.findMany({
        where: { user_id: user.id },
      });
      schoolIds = [...new Set(userSchools.map((us) => us.school_id))];
      const roleMap = new Map<string, string>();
      for (const us of userSchools) {
        roleMap.set(us.role, us.scope);
      }
      availableRoles = [...roleMap.keys()];
      scopeByRole = Object.fromEntries(roleMap);
    }
    const activeRole = availableRoles.includes(user.role)
      ? user.role
      : availableRoles[0];
    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar_url: user.avatar_url,
      school_ids: schoolIds,
      primary_school_id: user.school_id || schoolIds[0] || null,
      role: activeRole,
      roles: availableRoles,
      scope_by_role: scopeByRole,
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
    );

    const existing = await this.refreshRepo.find({
      where: { user_id: user.id },
      orderBy: { created_at: 'asc' },
    });
    if (existing.length >= 5) {
      const toDelete = existing.slice(0, existing.length - 4);
      const ids = toDelete.map((t) => t.id);
      if (ids.length) await this.refreshRepo.delete({ id: { in: ids } });
    }

    const expiresAt = new Date(Date.now() + this.getRefreshTTLMs());
    const refreshSchoolId = user.school_id || schoolIds[0];
    await this.refreshRepo.save({
      token: refreshToken,
      user_id: user.id,
      school_id: refreshSchoolId,
      expires_at: expiresAt,
    });

    const userProfile = await this.getProfile(user.id);
    return { accessToken, refreshToken, user: userProfile };
  }

  async refresh(refreshToken: string): Promise<Tokens> {
    const stored = await this.refreshRepo.findOne({
      where: { token: refreshToken },
    });
    if (!stored) throw new UnauthorizedException('Invalid refresh token');
    try {
      const decoded: any = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const user = await this.usersService.findById(decoded.sub);
      if (!user) throw new UnauthorizedException('Invalid token user');

      let schoolIds: number[];
      let availableRoles: string[] = [user.role];
      let scopeByRole: Record<string, string> = { [user.role]: 'SCHOOL' };
      if (user.role === 'BACKOFFICE') {
        const allSchools = await this.prisma.school.findMany({
          select: { id: true },
        });
        schoolIds = allSchools.map((s) => s.id);
      } else {
        const userSchools = await this.prisma.userSchool.findMany({
          where: { user_id: user.id },
        });
        schoolIds = [...new Set(userSchools.map((us) => us.school_id))];
        const roleMap = new Map<string, string>();
        for (const us of userSchools) {
          roleMap.set(us.role, us.scope);
        }
        availableRoles = [...roleMap.keys()];
        scopeByRole = Object.fromEntries(roleMap);
      }
      const activeRole = availableRoles.includes(user.role)
        ? user.role
        : availableRoles[0];
      const payload = {
        sub: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar_url,
        school_ids: schoolIds,
        primary_school_id: user.school_id || schoolIds[0] || null,
        role: activeRole,
        roles: availableRoles,
        scope_by_role: scopeByRole,
      };
      const accessToken = this.jwtService.sign(payload);
      const newRefresh = this.jwtService.sign(
        { sub: user.id },
        { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
      );

      await this.refreshRepo.delete({ token: refreshToken });
      const expiresAt = new Date(Date.now() + this.getRefreshTTLMs());
      const refreshSchoolId = user.school_id || schoolIds[0];
      await this.refreshRepo.save({
        token: newRefresh,
        user_id: user.id,
        school_id: refreshSchoolId,
        expires_at: expiresAt,
      });

      const userProfile = await this.getProfile(user.id);
      return { accessToken, refreshToken: newRefresh, user: userProfile };
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      if (e instanceof JsonWebTokenError)
        throw new UnauthorizedException('Invalid or expired refresh token');
      throw new InternalServerErrorException('Token refresh failed');
    }
  }

  async logout(refreshToken: string) {
    await this.refreshRepo.delete({ token: refreshToken });
  }

  async switchRole(
    userId: number,
    currentSchoolId: number,
    newRole: string,
  ): Promise<Tokens> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('Utilisateur introuvable');
    const userSchools = await this.prisma.userSchool.findMany({
      where: { user_id: userId },
    });
    if (
      !userSchools.some(
        (us) => us.role === newRole && us.school_id === currentSchoolId,
      )
    ) {
      throw new ForbiddenException('Rôle non attribué à cette école');
    }
    const schoolIds = [...new Set(userSchools.map((us) => us.school_id))];
    const roleMap = new Map<string, string>();
    for (const us of userSchools) {
      roleMap.set(us.role, us.scope);
    }
    const availableRoles = [...roleMap.keys()];
    const scopeByRole = Object.fromEntries(roleMap);
    const payload = {
      sub: userId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar_url: user.avatar_url,
      school_ids: schoolIds,
      primary_school_id: currentSchoolId,
      role: newRole,
      roles: availableRoles,
      scope_by_role: scopeByRole,
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { sub: userId },
      { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
    );
    const expiresAt = new Date(Date.now() + this.getRefreshTTLMs());
    await this.refreshRepo.save({
      token: refreshToken,
      user_id: userId,
      school_id: currentSchoolId,
      expires_at: expiresAt,
    });
    const userProfile = await this.getProfile(userId);
    return { accessToken, refreshToken, user: userProfile };
  }

  async verifyInvitation(code: string) {
    return this.invitationsService.verifyInvitation(code);
  }

  async registerWithInvitation(dto: RegisterWithInvitationDto) {
    const verification = await this.invitationsService.verifyInvitation(
      dto.code,
    );
    if (
      !verification.valid ||
      !verification.school_id ||
      !verification.target_ids
    ) {
      throw new BadRequestException('Invitation invalide ou expirée');
    }

    const targetType = verification.target_type;
    const targetIds = verification.target_ids;
    const schoolId = verification.school_id;

    const identifier = dto.email || dto.phone;
    if (!identifier) {
      throw new BadRequestException('Email ou téléphone requis');
    }

    const user = await this.usersService.findByIdentifier(identifier);

    if (user) {
      await this.prisma.$transaction(async (tx) => {
        const existingSchool = await tx.userSchool.findFirst({
          where: { user_id: user.id, school_id: schoolId },
        });
        if (!existingSchool) {
          await tx.userSchool.create({
            data: {
              user_id: user.id,
              school_id: schoolId,
              role: targetType === 'PARENT' ? 'PARENT' : 'TEACHER',
            },
          });
        }

        if (targetType === 'PARENT') {
          await tx.studentParent.createMany({
            data: targetIds.map((studentId) => ({
              student_id: studentId,
              parent_user_id: user.id,
              school_id: schoolId,
            })),
            skipDuplicates: true,
          });
        }
      });

      await this.invitationsService.useInvitation(dto.code);

      return this.login(identifier, dto.password);
    }

    const newUser = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      password: dto.password,
      role: targetType === 'PARENT' ? 'PARENT' : 'TEACHER',
      school_id: schoolId,
    });

    await this.prisma.$transaction(async (tx) => {
      if (targetType === 'PARENT') {
        await tx.studentParent.createMany({
          data: targetIds.map((studentId) => ({
            student_id: studentId,
            parent_user_id: newUser.id,
            school_id: schoolId,
          })),
        });
      }
    });

    await this.invitationsService.useInvitation(dto.code);

    return this.login(identifier, dto.password);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByIdentifier(email);
    if (!user) {
      return;
    }

    await this.prisma.passwordResetToken.updateMany({
      where: {
        user_id: user.id,
        used_at: null,
        expires_at: { gt: new Date() },
      },
      data: { expires_at: new Date(0) },
    });

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await this.prisma.passwordResetToken.create({
      data: { token, user_id: user.id, email, expires_at: expiresAt },
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    this.logger.log(`Password reset link for ${email}: ${resetUrl}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });
    if (
      !resetToken ||
      resetToken.used_at ||
      resetToken.expires_at < new Date()
    ) {
      throw new BadRequestException('Token invalide ou expiré');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: resetToken.user_id },
        data: { password: hashed },
      });
      await tx.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used_at: new Date() },
      });
    });
  }

  async linkInvitation(userId: number, code: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const verification = await this.invitationsService.verifyInvitation(code);
    if (
      !verification.valid ||
      !verification.school_id ||
      !verification.target_ids
    ) {
      throw new BadRequestException('Invitation invalide ou expirée');
    }

    const schoolId = verification.school_id;

    await this.prisma.$transaction(async (tx) => {
      const existingSchool = await tx.userSchool.findFirst({
        where: { user_id: userId, school_id: schoolId },
      });
      if (!existingSchool) {
        await tx.userSchool.create({
          data: {
            user_id: userId,
            school_id: schoolId,
            role: verification.target_type === 'PARENT' ? 'PARENT' : 'TEACHER',
          },
        });
      }

      if (verification.target_type === 'PARENT') {
        await tx.studentParent.createMany({
          data: verification.target_ids.map((studentId) => ({
            student_id: studentId,
            parent_user_id: userId,
            school_id: schoolId,
          })),
          skipDuplicates: true,
        });
      }
    });

    await this.invitationsService.useInvitation(code);
  }
}
