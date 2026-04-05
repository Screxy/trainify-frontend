import { defineStore } from 'pinia'
import { ref } from 'vue'
import { analyticsApi } from '../api'
import type { ProgressPoint, PersonalRecord } from '@/shared/types'

export const useAnalyticsStore = defineStore('analytics', () => {
  const progressData = ref<ProgressPoint[]>([])
  const records = ref<PersonalRecord[]>([])
  const loading = ref(false)

  async function fetchProgress(exerciseId: number, period: 'week' | 'month' | 'year') {
    loading.value = true
    try {
      const { data } = await analyticsApi.getProgress(exerciseId, period)
      progressData.value = data
    } finally {
      loading.value = false
    }
  }

  async function fetchRecords() {
    loading.value = true
    try {
      const { data } = await analyticsApi.getRecords()
      records.value = data
    } finally {
      loading.value = false
    }
  }

  return { progressData, records, loading, fetchProgress, fetchRecords }
})
