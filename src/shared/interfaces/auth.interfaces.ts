/** Interfaces para los datos de autenticación */

export interface ILoginPayload {
    email: string;
    password: string;
}

export interface IRegisterPayload {
    email: string;
    password: string;
    name: string;
}

export interface IRefreshTokenPayload {
    refreshToken: string;
}

export interface IAuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface IJwtPayload {
    sub: string;
    email: string;
    role: string;
}
