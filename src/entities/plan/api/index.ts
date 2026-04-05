import { api } from '@/shared/api'
import type { WorkoutPlan, WorkoutPlanDetail, CreatePlanRequest, UpdatePlanRequest } from '@/shared/types'

export const planApi = {
  list() {
    return api.get<WorkoutPlan[]>('/plans')
  },
  get(id: number) {
    return api.get<WorkoutPlanDetail>(`/plans/${id}`)
  },
  create(data: CreatePlanRequest) {
    return api.post<WorkoutPlanDetail>('/plans', data)
  },
  update(id: number, data: UpdatePlanRequest) {
    return api.put<WorkoutPlanDetail>(`/plans/${id}`, data)
  },
  delete(id: number) {
    return api.delete(`/plans/${id}`)
  },
}
