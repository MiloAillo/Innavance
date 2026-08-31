export interface AdminLoginCredentials {
    username: string;
    password: string;
}

export interface AdminLoginResponse {
    refreshToken: string;
    activeToken: string;
}
