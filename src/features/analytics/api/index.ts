import { api } from '@/shared/api'
import type { ProgressPoint, PersonalRecord } from '@/shared/types'

export const analyticsApi = {
  getProgress(exercise_id: number, period: 'week' | 'month' | 'year') {
    return api.get<ProgressPoint[]>('/analytics/progress', {
      params: { exercise_id, period },
    })
  },
  getRecords() {
    return api.get<PersonalRecord[]>('/analytics/records')
  },
}
