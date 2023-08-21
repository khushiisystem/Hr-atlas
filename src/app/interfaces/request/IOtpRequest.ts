export interface IOTPRequest {
    emailOrPhone: string,
    isEmail: boolean,
}

export interface IResetPasswordRequest {
    password: string,
    confirmPassword: string,
}