import { api } from '@/shared/api'
import type { User } from '@/shared/types'

export const profileApi = {
  getMe() {
    return api.get<User>('/users/me')
  },
  updateProfile(data: { name?: string }) {
    return api.put<User>('/users/me', data)
  },
  changePassword(data: { current_password: string; new_password: string }) {
    return api.put('/users/me/password', data)
  },
}
