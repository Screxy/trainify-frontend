<script setup lang="ts">
import { ref } from 'vue'
import { AuthLayout, AppInput, AppButton } from '@/shared/ui'
import { useAuthStore } from '@/features/auth'
import { RouterLink } from 'vue-router'

const authStore = useAuthStore()

const email = ref('')
const password = ref('')

async function handleSubmit() {
  await authStore.login({ email: email.value, password: password.value })
}
</script>

<template>
  <AuthLayout subtitle="Войдите в свой аккаунт">
    <form class="flex flex-col gap-6" @submit.prevent="handleSubmit">
      <!-- Form fields -->
      <div class="flex flex-col gap-4">
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
        <RouterLink
          to="/forgot-password"
          class="self-start text-[13px] text-[#22C55E] hover:text-[#16A34A] transition-colors md:self-end"
        >
          Забыли пароль?
        </RouterLink>
      </div>

      <!-- Error -->
      <p v-if="authStore.error" class="text-sm text-[#EF4444]">
        {{ authStore.error }}
      </p>

      <!-- Submit -->
      <AppButton
        type="submit"
        class="w-full"
        :loading="authStore.loading"
      >
        Войти
      </AppButton>

      <!-- Register link -->
      <p class="text-center text-[13px] text-[#94A3B8]">
        Нет аккаунта?
        <RouterLink
          to="/register"
          class="font-semibold text-[#22C55E] hover:text-[#16A34A] transition-colors"
        >
          Зарегистрироваться
        </RouterLink>
      </p>
    </form>
  </AuthLayout>
</template>
