import { api } from '@/shared/api'
import type {
  AIInsightJob,
  AIInsightLatest,
  CreateAIInsightRequest,
} from '@/shared/types'

export const aiInsightsApi = {
  getLatest() {
    return api.get<AIInsightLatest>('/ai/insights/latest')
  },
  get(id: string) {
    return api.get<AIInsightJob>(`/ai/insights/${id}`)
  },
  create(body: CreateAIInsightRequest) {
    return api.post<AIInsightJob>('/ai/insights', body)
  },
}
