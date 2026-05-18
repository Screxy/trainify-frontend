import { api } from '@/shared/api'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  name?: string
}

export interface AuthTokens {
  access_token: string
}

export const authApi = {
  login(payload: LoginPayload) {
    return api.post<AuthTokens>('/users/login', payload)
  },
  register(payload: RegisterPayload) {
    return api.post<AuthTokens>('/users/register', payload)
  },
  refreshToken() {
    return api.get<AuthTokens>('/users/refresh-token')
  },
  forgotPassword(email: string) {
    return api.post('/users/forgot-password', { email })
  },
  resetPassword(token: string, newPassword: string) {
    return api.post('/users/reset-password', { token, new_password: newPassword })
  },
}
