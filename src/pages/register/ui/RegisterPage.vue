<script setup lang="ts">
import { ref } from 'vue'
import { AuthLayout, AppInput, AppButton } from '@/shared/ui'
import { useAuthStore } from '@/features/auth'
import { RouterLink } from 'vue-router'

const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const validationError = ref('')

async function handleSubmit() {
  validationError.value = ''

  if (password.value.length < 6) {
    validationError.value = 'Пароль должен содержать минимум 6 символов'
    return
  }

  if (password.value !== passwordConfirmation.value) {
    validationError.value = 'Пароли не совпадают'
    return
  }

  await authStore.register({
    email: email.value,
    password: password.value,
    name: name.value.trim() || undefined,
  })
}
</script>

<template>
  <AuthLayout subtitle="Создайте новый аккаунт" :mobile-padding-top="60">
    <form class="flex flex-col gap-6" @submit.prevent="handleSubmit">
      <!-- Form fields -->
      <div class="flex flex-col gap-4">
        <AppInput
          v-model="name"
          label="Имя"
          placeholder="Алексей"
        />
        <AppInput
          v-model="email"
          label="Email"
          type="email"
          placeholder="example@email.com"
        />
        <AppInput
          v-model="password"
          label="Пароль"
          type="password"
          placeholder="••••••••"
        />
        <AppInput
          v-model="passwordConfirmation"
          label="Подтверждение пароля"
          type="password"
          placeholder="••••••••"
        />
      </div>

      <!-- Errors -->
      <p v-if="validationError || authStore.error" class="text-sm text-[#EF4444]">
        {{ validationError || authStore.error }}
      </p>

      <!-- Submit -->
      <AppButton
        type="submit"
        class="w-full"
        :loading="authStore.loading"
      >
        Зарегистрироваться
      </AppButton>

      <!-- Login link -->
      <p class="text-center text-[13px] text-[#94A3B8]">
        Уже есть аккаунт?
        <RouterLink
          to="/login"
          class="font-semibold text-[#22C55E] hover:text-[#16A34A] transition-colors"
        >
          Войти
        </RouterLink>
      </p>
    </form>
  </AuthLayout>
</template>
