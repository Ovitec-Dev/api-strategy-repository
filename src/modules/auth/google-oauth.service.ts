import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleOAuthService {
    private readonly logger = new Logger(GoogleOAuthService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly authService: AuthService,
    ) { }

    async syncUser(googleProfile: any) {
        if (!googleProfile.emails || googleProfile.emails.length === 0) {
            throw new UnauthorizedException('No email provided by Google');
        }

        const email = googleProfile.emails[0].value;
        let user = await this.userRepository.findOne({ where: { email } });

        if (!user) {
            user = this.userRepository.create({
                email,
                googleId: googleProfile.id,
                name: googleProfile.displayName,
                avatar: googleProfile.photos?.[0]?.value,
                passwordHash: null, // OAuth users don't have passwords initially
            });
            await this.userRepository.save(user);
        } else if (!user.googleId) {
            // Link existing account with Google
            user.googleId = googleProfile.id;
            user.avatar = user.avatar || googleProfile.photos?.[0]?.value;
            await this.userRepository.save(user);
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Account is inactive');
        }

        return this.authService.generateTokens(user);
    }
}
