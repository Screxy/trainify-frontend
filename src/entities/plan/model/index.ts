import { defineStore } from 'pinia'
import { ref } from 'vue'
import { planApi } from '../api'
import type { WorkoutPlan, WorkoutPlanDetail, CreatePlanRequest, UpdatePlanRequest } from '@/shared/types'

export const usePlanStore = defineStore('plan', () => {
  const plans = ref<WorkoutPlan[]>([])
  const currentPlan = ref<WorkoutPlanDetail | null>(null)
  const loading = ref(false)

  async function fetchPlans() {
    loading.value = true
    try {
      const { data } = await planApi.list()
      plans.value = data
    } finally {
      loading.value = false
    }
  }

  async function fetchPlan(id: number) {
    loading.value = true
    try {
      const { data } = await planApi.get(id)
      currentPlan.value = data
    } finally {
      loading.value = false
    }
  }

  async function createPlan(payload: CreatePlanRequest) {
    const { data } = await planApi.create(payload)
    plans.value.push(data)
    return data
  }

  async function updatePlan(id: number, payload: UpdatePlanRequest) {
    const { data } = await planApi.update(id, payload)
    const idx = plans.value.findIndex((p) => p.id === id)
    if (idx !== -1) plans.value[idx] = data
    currentPlan.value = data
    return data
  }

  async function deletePlan(id: number) {
    await planApi.delete(id)
    plans.value = plans.value.filter((p) => p.id !== id)
  }

  return { plans, currentPlan, loading, fetchPlans, fetchPlan, createPlan, updatePlan, deletePlan }
})
