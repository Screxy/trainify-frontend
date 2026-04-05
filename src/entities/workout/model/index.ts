import { defineStore } from 'pinia'
import { ref } from 'vue'
import { workoutApi } from '../api'
import type {
  WorkoutSession,
  WorkoutSessionDetail,
  CreateWorkoutRequest,
  AddSetsRequest,
} from '@/shared/types'

export const useWorkoutStore = defineStore('workout', () => {
  const workouts = ref<WorkoutSession[]>([])
  const currentWorkout = ref<WorkoutSessionDetail | null>(null)
  const loading = ref(false)

  async function fetchWorkouts(params?: { from?: string; to?: string; limit?: number; offset?: number }) {
    loading.value = true
    try {
      const { data } = await workoutApi.list(params)
      workouts.value = data
    } finally {
      loading.value = false
    }
  }

  async function fetchWorkout(id: number) {
    loading.value = true
    try {
      const { data } = await workoutApi.get(id)
      currentWorkout.value = data
    } finally {
      loading.value = false
    }
  }

  async function createWorkout(payload: CreateWorkoutRequest) {
    const { data } = await workoutApi.create(payload)
    workouts.value.unshift(data)
    return data
  }

  async function addSets(id: number, payload: AddSetsRequest) {
    await workoutApi.addSets(id, payload)
  }

  async function completeWorkout(id: number) {
    const { data } = await workoutApi.complete(id)
    const idx = workouts.value.findIndex((w) => w.id === id)
    if (idx !== -1) workouts.value[idx] = data
    if (currentWorkout.value?.id === id) {
      currentWorkout.value = { ...currentWorkout.value, ...data }
    }
    return data
  }

  return { workouts, currentWorkout, loading, fetchWorkouts, fetchWorkout, createWorkout, addSets, completeWorkout }
})
