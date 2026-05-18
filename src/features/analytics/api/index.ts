import { api } from '@/shared/api'
import type { DashboardResponse, PersonalRecord, ProgressPoint } from '@/shared/types'

export const analyticsApi = {
  getProgress(exercise_id: number, period: 'week' | 'month' | 'year') {
    return api.get<ProgressPoint[]>('/analytics/progress', {
      params: { exercise_id, period },
    })
  },
  getRecords() {
    return api.get<PersonalRecord[]>('/analytics/records')
  },
  getDashboard() {
    return api.get<DashboardResponse>('/analytics/dashboard')
  },
}

export { aiInsightsApi } from './insights'
