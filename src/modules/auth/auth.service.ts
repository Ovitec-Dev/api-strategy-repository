import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepository: Repository<RefreshToken>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async register(dto: RegisterDto) {
        const existingUser = await this.userRepository.findOne({ where: { email: dto.email } });
        if (existingUser) {
            throw new BadRequestException('User already exists');
        }

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(dto.password, salt);

        const user = this.userRepository.create({
            email: dto.email,
            passwordHash,
            name: dto.name,
        });

        await this.userRepository.save(user);

        return this.generateTokens(user);
    }

    async login(dto: LoginDto) {
        const user = await this.userRepository.findOne({ where: { email: dto.email } });
        if (!user || user.passwordHash === null) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Account is inactive');
        }

        return this.generateTokens(user);
    }

    async refreshTokens(refreshToken: string) {
        const tokenRecord = await this.refreshTokenRepository.findOne({
            where: { token: refreshToken },
            relations: ['user'],
        });

        if (!tokenRecord || tokenRecord.revokedAt || new Date() > tokenRecord.expiresAt) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        if (!tokenRecord.user.isActive) {
            throw new UnauthorizedException('User account is inactive');
        }

        // Revoke the old token
        tokenRecord.revokedAt = new Date();
        await this.refreshTokenRepository.save(tokenRecord);

        return this.generateTokens(tokenRecord.user);
    }

    async revokeToken(refreshToken: string) {
        const tokenRecord = await this.refreshTokenRepository.findOne({ where: { token: refreshToken } });
        if (tokenRecord && !tokenRecord.revokedAt) {
            tokenRecord.revokedAt = new Date();
            await this.refreshTokenRepository.save(tokenRecord);
        }
    }

    async validateRefreshToken(token: string): Promise<boolean> {
        const tokenRecord = await this.refreshTokenRepository.findOne({ where: { token } });
        if (!tokenRecord || tokenRecord.revokedAt || new Date() > tokenRecord.expiresAt) {
            return false;
        }
        return true;
    }

    async generateTokens(user: User) {
        const payload = { sub: user.id, email: user.email, role: user.role };

        const secret = this.configService.get<string>('jwt.secret');
        const expiresIn = this.configService.get<string>('jwt.expiresIn');
        const accessToken = this.jwtService.sign(payload, {
            secret,
            expiresIn: expiresIn as any,
        });

        const refreshTokenString = bcrypt.genSaltSync(16);
        const expirationDays = this.configService.get<number>('jwt.refreshExpirationDays') ?? 7;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expirationDays);

        const refreshTokenEntity = this.refreshTokenRepository.create({
            user,
            token: refreshTokenString,
            expiresAt,
        });

        await this.refreshTokenRepository.save(refreshTokenEntity);

        return {
            accessToken,
            refreshToken: refreshTokenString,
        };
    }
}
