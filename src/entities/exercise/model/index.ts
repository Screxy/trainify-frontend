import { defineStore } from 'pinia'
import { ref } from 'vue'
import { exerciseApi } from '../api'
import type { Exercise, CreateExerciseRequest } from '@/shared/types'

export const useExerciseStore = defineStore('exercise', () => {
  const exercises = ref<Exercise[]>([])
  const loading = ref(false)

  async function fetchExercises(filters?: { muscle_group?: string; type?: string }) {
    loading.value = true
    try {
      const { data } = await exerciseApi.list(filters)
      exercises.value = data
    } finally {
      loading.value = false
    }
  }

  async function createExercise(payload: CreateExerciseRequest) {
    const { data } = await exerciseApi.create(payload)
    exercises.value.push(data)
    return data
  }

  return { exercises, loading, fetchExercises, createExercise }
})
