import { Injectable, UnauthorizedException, Inject, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh_token.entity';
import { REDIS_CLIENT } from '../common/redis.provider';
import { Redis } from '@upstash/redis';

export interface Tokens {
	accessToken: string;
	refreshToken: string;
}

@Injectable()
export class AuthService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly usersService: UsersService,
		@InjectRepository(RefreshToken)
		private readonly refreshRepo: Repository<RefreshToken>,
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

	async login(email: string, password: string): Promise<Tokens> {
		const blockKey = `block:${email}`;
		const attemptKey = `attempts:${email}`;

		const isBlocked = await this.redis.get<string>(blockKey);
		if (isBlocked) throw new ForbiddenException('Account temporarily blocked. Try again in 15 minutes.');

		const user = await this.usersService.findByEmail(email);
		const valid = user ? await this.usersService.verifyPassword(user, password) : false;

		if (!valid || !user) {
			const attempts = await this.redis.incr(attemptKey);
			if (attempts === 1) await this.redis.expire(attemptKey, 900);
			if (attempts >= 5) {
				await this.redis.set(blockKey, '1', { ex: 900 });
				await this.redis.del(attemptKey);
			}
			throw new UnauthorizedException('Invalid credentials');
		}

		await this.redis.del(attemptKey);

		const payload = { sub: user.id, school_id: user.school_id };
		const accessToken = this.jwtService.sign(payload);
		const refreshToken = this.jwtService.sign({ sub: user.id }, { expiresIn: '7d' });

		const existing = await this.refreshRepo.find({ where: { user_id: user.id }, order: { created_at: 'ASC' } });
		if (existing.length >= 5) {
			const toDelete = existing.slice(0, existing.length - 4);
			const ids = toDelete.map((t) => t.id);
			if (ids.length) await this.refreshRepo.delete(ids);
		}

		const expiresAt = new Date(Date.now() + this.getRefreshTTLMs());
		await this.refreshRepo.save({ token: refreshToken, user_id: user.id, expires_at: expiresAt });

		return { accessToken, refreshToken };
	}

	async refresh(refreshToken: string): Promise<Tokens> {
		const stored = await this.refreshRepo.findOne({ where: { token: refreshToken } });
		if (!stored) throw new UnauthorizedException('Invalid refresh token');
		try {
			const decoded: any = this.jwtService.verify(refreshToken);
			const user = await this.usersService.findById(decoded.sub);
			if (!user) throw new UnauthorizedException('Invalid token user');

			const payload = { sub: user.id, school_id: user.school_id };
			const accessToken = this.jwtService.sign(payload);
			const newRefresh = this.jwtService.sign({ sub: user.id }, { expiresIn: '7d' });

			await this.refreshRepo.delete({ token: refreshToken });
			const expiresAt = new Date(Date.now() + this.getRefreshTTLMs());
			await this.refreshRepo.save({ token: newRefresh, user_id: user.id, expires_at: expiresAt });

			return { accessToken, refreshToken: newRefresh };
		} catch (e) {
			throw new UnauthorizedException('Invalid refresh token');
		}
	}

	async logout(refreshToken: string) {
		await this.refreshRepo.delete({ token: refreshToken });
	}
}
