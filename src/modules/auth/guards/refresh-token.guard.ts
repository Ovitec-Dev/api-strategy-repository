import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';

@Injectable()
export class RefreshTokenGuard {
    constructor(private authService: AuthService) { }

    async canActivate(context: any): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const refreshToken = request.body?.refreshToken;

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token is required');
        }

        const isValid = await this.authService.validateRefreshToken(refreshToken);
        if (!isValid) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        return true;
    }
}
