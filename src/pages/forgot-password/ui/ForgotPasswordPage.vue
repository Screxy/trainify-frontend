<script setup lang="ts">
import { ref } from 'vue'
import { AuthLayout, AppInput, AppButton } from '@/shared/ui'
import { authApi } from '@/features/auth'
import { useToast } from '@/shared/lib/useToast'
import { RouterLink } from 'vue-router'
import { KeyRound, ArrowLeft, CheckCircle } from 'lucide-vue-next'

const toast = useToast()
const email = ref('')
const loading = ref(false)
const sent = ref(false)
const error = ref('')

async function handleSubmit() {
  loading.value = true
  error.value = ''
  try {
    await authApi.forgotPassword(email.value)
    sent.value = true
  } catch {
    toast.error('Не удалось отправить ссылку. Попробуйте позже.')
    error.value = 'Произошла ошибка'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout subtitle="">
    <div class="flex flex-col items-center gap-2 mb-6">
      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
        <KeyRound :size="24" class="text-accent" />
      </div>
      <h2 class="text-[22px] font-bold text-text-primary">Забыли пароль?</h2>
      <p class="max-w-[300px] text-center text-sm text-text-secondary">
        Введите email, и мы отправим ссылку для сброса пароля
      </p>
    </div>

    <form v-if="!sent" class="flex flex-col gap-6" @submit.prevent="handleSubmit">
      <AppInput
        v-model="email"
        label="Email"
        type="email"
        placeholder="example@email.com"
        :error="error"
      />

      <AppButton type="submit" class="w-full" :loading="loading">
        Отправить ссылку
      </AppButton>

      <RouterLink
        to="/login"
        class="flex items-center justify-center gap-2 text-[13px] text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft :size="14" />
        Вернуться к входу
      </RouterLink>
    </form>

    <div v-else class="flex flex-col gap-6">
      <div class="flex items-center gap-3 rounded-lg bg-accent/10 p-4">
        <CheckCircle :size="20" class="shrink-0 text-accent" />
        <span class="text-sm text-text-primary">Ссылка отправлена на ваш email</span>
      </div>

      <RouterLink
        to="/login"
        class="flex items-center justify-center gap-2 text-[13px] text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft :size="14" />
        Вернуться к входу
      </RouterLink>
    </div>
  </AuthLayout>
</template>
