import { defineStore } from 'pinia'
import { ref } from 'vue'
import { analyticsApi } from '../api'
import type { DashboardResponse } from '@/shared/types'

export const useDashboardStore = defineStore('dashboard', () => {
  const data = ref<DashboardResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchDashboard() {
    loading.value = true
    error.value = null
    try {
      const res = await analyticsApi.getDashboard()
      data.value = res.data
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Не удалось загрузить дашборд'
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, fetchDashboard }
})
