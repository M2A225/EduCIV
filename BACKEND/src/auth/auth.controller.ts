import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterWithInvitationDto } from './dto/register-with-invitation.dto';
import { LinkInvitationDto } from './dto/link-invitation.dto';
import { SwitchRoleDto } from './dto/switch-role.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const REFRESH_COOKIE = 'refresh_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export interface AuthRequest extends Request {
  cookies: Record<string, string>;
  user: {
    userId: number;
    primary_school_id?: number;
    school_ids?: number[];
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(body.identifier, body.password);
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);
    return {
      success: true,
      data: { accessToken: tokens.accessToken, user: tokens.user },
      error: null,
    };
  }

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  @Post('refresh')
  async refresh(@Req() req: AuthRequest, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) {
      throw new UnauthorizedException('Aucun token de rafraîchissement');
    }
    const tokens = await this.authService.refresh(token);
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);
    return {
      success: true,
      data: { accessToken: tokens.accessToken, user: tokens.user },
      error: null,
    };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('logout')
  async logout(@Req() req: AuthRequest, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (token) {
      await this.authService.logout(token);
    }
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
    return { success: true, data: null, error: null };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: AuthRequest) {
    const profile = await this.authService.getProfile(req.user.userId);
    return { success: true, data: profile, error: null };
  }

  @Get('verify-invitation')
  async verifyInvitation(@Query('code') code: string) {
    const result = await this.authService.verifyInvitation(code);
    return { success: true, data: result, error: null };
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  @Post('register-with-invitation')
  async registerWithInvitation(
    @Body() body: RegisterWithInvitationDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.registerWithInvitation(body);
    res.cookie(REFRESH_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);
    return {
      success: true,
      data: { accessToken: tokens.accessToken },
      error: null,
    };
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('link-invitation')
  async linkInvitation(@Body() body: LinkInvitationDto, @Req() req: AuthRequest) {
    await this.authService.linkInvitation(req.user.userId, body.code);
    return { success: true, data: null, error: null };
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    await this.authService.forgotPassword(body.email);
    return { success: true, data: null, error: null };
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    await this.authService.resetPassword(body.token, body.password);
    return { success: true, data: null, error: null };
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('switch-role')
  async switchRole(@Body() body: SwitchRoleDto, @Req() req: AuthRequest) {
    const maybeSchoolId = req.user.primary_school_id || req.user.school_ids?.[0];
    if (maybeSchoolId == null) {
      throw new UnauthorizedException('Aucune école associée');
    }
    const tokens = await this.authService.switchRole(
      req.user.userId,
      maybeSchoolId,
      body.role,
    );
    return {
      success: true,
      data: { accessToken: tokens.accessToken, user: tokens.user },
      error: null,
    };
  }
}
