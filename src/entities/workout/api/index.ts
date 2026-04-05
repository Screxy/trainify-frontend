import { api } from '@/shared/api'
import type {
  WorkoutSession,
  WorkoutSessionDetail,
  CreateWorkoutRequest,
  AddSetsRequest,
} from '@/shared/types'

export const workoutApi = {
  list(params?: { from?: string; to?: string; limit?: number; offset?: number }) {
    return api.get<WorkoutSession[]>('/workouts', { params })
  },
  get(id: number) {
    return api.get<WorkoutSessionDetail>(`/workouts/${id}`)
  },
  create(data: CreateWorkoutRequest) {
    return api.post<WorkoutSession>('/workouts', data)
  },
  addSets(id: number, data: AddSetsRequest) {
    return api.post(`/workouts/${id}/sets`, data)
  },
  complete(id: number) {
    return api.post<WorkoutSession>(`/workouts/${id}/complete`)
  },
}
