import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api'
import type { LoginPayload, RegisterPayload } from '../api'
import { useRouter } from 'vue-router'
import { decodeJwt } from '@/shared/lib/decodeJwt'
import type { User } from '@/shared/types'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref('')
  const isAuthenticated = ref(false)
  const isAdmin = computed(() => user.value?.role === 'admin')

  function setToken(token: string) {
    localStorage.setItem('access_token', token)
    try {
      user.value = decodeJwt<User>(token)
    } catch {
      user.value = null
    }
    isAuthenticated.value = true
  }

  function initAuth() {
    const token = localStorage.getItem('access_token')
    if (token) {
      try {
        user.value = decodeJwt<User>(token)
        isAuthenticated.value = true
      } catch {
        localStorage.removeItem('access_token')
      }
    }
  }

  async function login(payload: LoginPayload) {
    loading.value = true
    error.value = ''
    try {
      const { data } = await authApi.login(payload)
      setToken(data.access_token)
      router.push('/')
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      error.value = err.response?.data?.message ?? 'Неверный email или пароль'
    } finally {
      loading.value = false
    }
  }

  async function register(payload: RegisterPayload) {
    loading.value = true
    error.value = ''
    try {
      const { data } = await authApi.register(payload)
      setToken(data.access_token)
      router.push('/')
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      error.value = err.response?.data?.message ?? 'Ошибка регистрации'
    } finally {
      loading.value = false
    }
  }

  function logout() {
    localStorage.removeItem('access_token')
    user.value = null
    isAuthenticated.value = false
    router.push('/login')
  }

  return { user, loading, error, isAuthenticated, isAdmin, initAuth, login, register, logout }
})
