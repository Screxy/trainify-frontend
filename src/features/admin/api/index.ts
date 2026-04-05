import { api } from '@/shared/api'
import type { User, Exercise } from '@/shared/types'

export interface AdminStats {
  total_users: number
  total_workouts: number
  active_today: number
}

export const adminApi = {
  listUsers(params?: { search?: string; role?: string }) {
    return api.get<User[]>('/admin/users', { params })
  },
  getStats() {
    return api.get<AdminStats>('/admin/stats')
  },
  listPendingExercises() {
    return api.get<Exercise[]>('/admin/exercises/pending')
  },
  approveExercise(id: number) {
    return api.post(`/admin/exercises/${id}/approve`)
  },
  rejectExercise(id: number) {
    return api.post(`/admin/exercises/${id}/reject`)
  },
}
