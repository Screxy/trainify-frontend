import { api } from '@/shared/api'
import type { Exercise, CreateExerciseRequest } from '@/shared/types'

export const exerciseApi = {
  list(params?: { muscle_group?: string; type?: string }) {
    return api.get<Exercise[]>('/exercises', { params })
  },
  create(data: CreateExerciseRequest) {
    return api.post<Exercise>('/exercises', data)
  },
}
