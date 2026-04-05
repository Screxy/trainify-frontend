import { defineStore } from 'pinia'
import { ref } from 'vue'
import { profileApi } from '../api'
import type { User } from '@/shared/types'

export const useProfileStore = defineStore('profile', () => {
  const profile = ref<User | null>(null)
  const loading = ref(false)

  async function fetchProfile() {
    loading.value = true
    try {
      const { data } = await profileApi.getMe()
      profile.value = data
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(payload: { name?: string }) {
    const { data } = await profileApi.updateProfile(payload)
    profile.value = data
  }

  async function changePassword(payload: { current_password: string; new_password: string }) {
    await profileApi.changePassword(payload)
  }

  return { profile, loading, fetchProfile, updateProfile, changePassword }
})
