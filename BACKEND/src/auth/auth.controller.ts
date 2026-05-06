import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	async login(@Body() body: LoginDto) {
		const tokens = await this.authService.login(body.email, body.password);
		return { success: true, data: tokens, error: null };
	}

	@Post('refresh')
	async refresh(@Body() body: RefreshDto) {
		const tokens = await this.authService.refresh(body.refreshToken);
		return { success: true, data: tokens, error: null };
	}

	@Post('logout')
	async logout(@Body() body: RefreshDto) {
		await this.authService.logout(body.refreshToken);
		return { success: true, data: null, error: null };
	}
}
