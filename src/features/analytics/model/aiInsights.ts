import { defineStore } from 'pinia'
import { computed, onScopeDispose, ref } from 'vue'
import axios from 'axios'
import { aiInsightsApi } from '../api/insights'
import { useToast } from '@/shared/lib'
import type {
  AIGoal,
  AIInsightJob,
  AIInsightLatest,
  AIInsightResult,
} from '@/shared/types'

type AIStatus =
  | 'idle'
  | 'loading'
  | 'submitting'
  | 'polling'
  | 'completed'
  | 'failed'
  | 'rate_limited'

const POLL_MS = 2000

export const useAiInsightsStore = defineStore('aiInsights', () => {
  const toast = useToast()

  const latest = ref<AIInsightLatest | null>(null)
  const currentJobId = ref<string | null>(null)
  const status = ref<AIStatus>('idle')
  const error = ref<string | null>(null)

  let timer: ReturnType<typeof setInterval> | null = null
  let activeId: string | null = null

  const nextAvailableAt = computed(() => latest.value?.next_available_at ?? null)

  const canCreate = computed(() => {
    if (status.value === 'submitting' || status.value === 'polling') return false
    if (!latest.value) return true
    if (!latest.value.job) return true
    if (!nextAvailableAt.value) return true
    return new Date(nextAvailableAt.value).getTime() <= Date.now()
  })

  const currentResult = computed<AIInsightResult | null>(
    () => latest.value?.job?.result ?? null,
  )

  function stopPolling() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    activeId = null
  }

  function startPolling(id: string) {
    stopPolling()
    activeId = id
    currentJobId.value = id
    status.value = 'polling'
    timer = setInterval(async () => {
      if (activeId !== id) return
      try {
        const { data } = await aiInsightsApi.get(id)
        if (activeId !== id) return
        if (data.status === 'completed') {
          stopPolling()
          status.value = 'completed'
          await fetchLatest()
        } else if (data.status === 'failed') {
          stopPolling()
          status.value = 'failed'
          error.value = data.error ?? 'AI job failed'
          toast.error(error.value)
        }
        // pending | running — keep polling
      } catch {
        stopPolling()
        status.value = 'failed'
        error.value = 'Не удалось проверить статус задачи'
        toast.error(error.value)
      }
    }, POLL_MS)
  }

  async function fetchLatest() {
    status.value = 'loading'
    error.value = null
    try {
      const { data } = await aiInsightsApi.getLatest()
      latest.value = data
      // If the latest job is still pending/running — resume polling
      if (data.job && (data.job.status === 'pending' || data.job.status === 'running')) {
        startPolling(data.job.id)
      } else {
        status.value = 'idle'
      }
    } catch {
      status.value = 'idle'
      latest.value = null
    }
  }

  async function createInsight(goal: AIGoal, notes?: string) {
    if (!canCreate.value) return
    status.value = 'submitting'
    error.value = null
    try {
      const { data } = await aiInsightsApi.create({ goal, notes: notes?.trim() || undefined })
      handleJob(data)
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 429) {
        const retryAfter = e.response.headers['retry-after']
        status.value = 'rate_limited'
        await fetchLatest()
        const msg = retryAfter
          ? `Лимит исчерпан. Попробуйте через ${formatRetry(Number(retryAfter))}.`
          : 'Лимит запросов исчерпан. Попробуйте позже.'
        toast.error(msg)
      } else {
        status.value = 'failed'
        error.value = 'Не удалось создать запрос'
        toast.error(error.value)
      }
    }
  }

  function handleJob(job: AIInsightJob) {
    if (job.status === 'pending' || job.status === 'running') {
      startPolling(job.id)
    } else if (job.status === 'completed') {
      currentJobId.value = job.id
      status.value = 'completed'
      void fetchLatest()
    } else {
      status.value = 'failed'
      error.value = job.error ?? 'AI job failed'
    }
  }

  function formatRetry(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds <= 0) return 'минуту'
    if (seconds < 60) return `${seconds} сек`
    const minutes = Math.ceil(seconds / 60)
    if (minutes < 60) return `${minutes} мин`
    const hours = Math.ceil(minutes / 60)
    return `${hours} ч`
  }

  onScopeDispose(stopPolling)

  return {
    latest,
    currentJobId,
    status,
    error,
    nextAvailableAt,
    canCreate,
    currentResult,
    fetchLatest,
    createInsight,
    stopPolling,
  }
})
