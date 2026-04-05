import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminApi } from '../api'
import type { AdminStats } from '../api'
import type { User, Exercise } from '@/shared/types'

export const useAdminStore = defineStore('admin', () => {
  const users = ref<User[]>([])
  const pendingExercises = ref<Exercise[]>([])
  const stats = ref<AdminStats | null>(null)
  const loading = ref(false)

  async function fetchUsers(params?: { search?: string; role?: string }) {
    loading.value = true
    try {
      const { data } = await adminApi.listUsers(params)
      users.value = data
    } finally {
      loading.value = false
    }
  }

  async function fetchStats() {
    loading.value = true
    try {
      const { data } = await adminApi.getStats()
      stats.value = data
    } finally {
      loading.value = false
    }
  }

  async function fetchPendingExercises() {
    loading.value = true
    try {
      const { data } = await adminApi.listPendingExercises()
      pendingExercises.value = data
    } finally {
      loading.value = false
    }
  }

  async function approveExercise(id: number) {
    await adminApi.approveExercise(id)
    pendingExercises.value = pendingExercises.value.filter((e) => e.id !== id)
  }

  async function rejectExercise(id: number) {
    await adminApi.rejectExercise(id)
    pendingExercises.value = pendingExercises.value.filter((e) => e.id !== id)
  }

  return { users, pendingExercises, stats, loading, fetchUsers, fetchStats, fetchPendingExercises, approveExercise, rejectExercise }
})
