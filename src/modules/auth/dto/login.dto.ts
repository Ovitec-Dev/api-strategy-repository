import { IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'user@example.com', description: 'Email del usuario' })
    @IsEmail({}, { message: 'El email debe ser válido' })
    email: string;

    @ApiProperty({ example: 'password123', minLength: 6, description: 'Contraseña del usuario' })
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password: string;
}
