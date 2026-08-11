import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
    @ApiProperty({ description: 'Refresh token para renovar el access token' })
    @IsString()
    @MinLength(1, { message: 'El refreshToken es requerido' })
    refreshToken: string;
}
