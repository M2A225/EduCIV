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
import type { Response } from 'express';
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

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setRefreshCookie(res: Response, token: string) {
    res.cookie(REFRESH_COOKIE, token, COOKIE_OPTIONS);
  }

  private clearRefreshCookie(res: Response) {
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.login(body.identifier, body.password);
    this.setRefreshCookie(res, tokens.refreshToken);
    return {
      success: true,
      data: { accessToken: tokens.accessToken, user: tokens.user },
      error: null,
    };
  }

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  @Post('refresh')
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) {
      throw new UnauthorizedException('Aucun token de rafraîchissement');
    }
    const tokens = await this.authService.refresh(token);
    this.setRefreshCookie(res, tokens.refreshToken);
    return {
      success: true,
      data: { accessToken: tokens.accessToken, user: tokens.user },
      error: null,
    };
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('logout')
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (token) {
      await this.authService.logout(token);
    }
    this.clearRefreshCookie(res);
    return { success: true, data: null, error: null };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: any, @Res({ passthrough: true }) res: Response) {
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
    this.setRefreshCookie(res, tokens.refreshToken);
    return {
      success: true,
      data: { accessToken: tokens.accessToken },
      error: null,
    };
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('link-invitation')
  async linkInvitation(@Body() body: LinkInvitationDto, @Req() req: any) {
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
  async switchRole(@Body() body: SwitchRoleDto, @Req() req: any) {
    const schoolId = req.user.primary_school_id || req.user.school_ids?.[0];
    const tokens = await this.authService.switchRole(
      req.user.userId,
      schoolId,
      body.role,
    );
    return {
      success: true,
      data: { accessToken: tokens.accessToken, user: tokens.user },
      error: null,
    };
  }
}
