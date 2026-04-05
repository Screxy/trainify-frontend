<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AuthLayout, AppInput, AppButton } from '@/shared/ui'
import { authApi } from '@/features/auth'
import { useToast } from '@/shared/lib/useToast'
import { Lock, ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const password = ref('')
const passwordConfirm = ref('')
const loading = ref(false)
const validationError = ref('')

async function handleSubmit() {
  validationError.value = ''

  if (password.value.length < 6) {
    validationError.value = 'Пароль должен содержать минимум 6 символов'
    return
  }
  if (password.value !== passwordConfirm.value) {
    validationError.value = 'Пароли не совпадают'
    return
  }

  loading.value = true
  try {
    const token = (route.query.token as string) ?? ''
    await authApi.resetPassword(token, password.value)
    toast.success('Пароль успешно изменён')
    router.push('/login')
  } catch {
    toast.error('Не удалось сменить пароль. Попробуйте позже.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout subtitle="">
    <div class="flex flex-col items-center gap-2 mb-6">
      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
        <Lock :size="24" class="text-accent" />
      </div>
      <h2 class="text-[22px] font-bold text-text-primary">Новый пароль</h2>
      <p class="text-sm text-text-secondary">Придумайте новый надёжный пароль</p>
    </div>

    <form class="flex flex-col gap-6" @submit.prevent="handleSubmit">
      <div class="flex flex-col gap-4">
        <AppInput
          v-model="password"
          label="Новый пароль"
          type="password"
          placeholder="••••••••"
        />
        <AppInput
          v-model="passwordConfirm"
          label="Подтверждение пароля"
          type="password"
          placeholder="••••••••"
        />
      </div>

      <p v-if="validationError" class="text-sm text-error">{{ validationError }}</p>

      <AppButton type="submit" class="w-full" :loading="loading">
        Сменить пароль
      </AppButton>

      <RouterLink
        to="/login"
        class="flex items-center justify-center gap-2 text-[13px] text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft :size="14" />
        Вернуться к входу
      </RouterLink>
    </form>
  </AuthLayout>
</template>
