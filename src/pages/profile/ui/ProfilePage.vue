<script setup lang="ts">
import { ref } from 'vue'
import { User, LogOut } from 'lucide-vue-next'
import { AppInput, AppButton } from '@/shared/ui'
import { useAuthStore } from '@/features/auth'
import { useProfileStore } from '@/features/profile'
import { useToast } from '@/shared/lib/useToast'

const authStore = useAuthStore()
const profileStore = useProfileStore()
const toast = useToast()

const name = ref(authStore.user?.name ?? '')
const email = ref(authStore.user?.email ?? '')

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const savingProfile = ref(false)
const savingPassword = ref(false)

async function saveProfile() {
  savingProfile.value = true
  try {
    await profileStore.updateProfile({ name: name.value })
    toast.success('Профиль обновлён')
  } catch {
    toast.error('Не удалось обновить профиль')
  } finally {
    savingProfile.value = false
  }
}

async function changePassword() {
  if (newPassword.value.length < 6) {
    toast.error('Пароль должен содержать минимум 6 символов')
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    toast.error('Пароли не совпадают')
    return
  }
  savingPassword.value = true
  try {
    await profileStore.changePassword({
      current_password: currentPassword.value,
      new_password: newPassword.value,
    })
    toast.success('Пароль изменён')
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch {
    toast.error('Не удалось сменить пароль')
  } finally {
    savingPassword.value = false
  }
}
</script>

<template>
  <div class="flex justify-center p-4 md:p-8">
    <div class="flex w-full max-w-[560px] flex-col gap-6">
      <h1 class="text-xl font-bold text-text-primary md:text-2xl">Профиль</h1>

      <!-- Avatar -->
      <div class="flex justify-center">
        <div class="flex h-24 w-24 items-center justify-center rounded-full border-2 border-accent bg-bg-card">
          <User :size="40" class="text-text-secondary" />
        </div>
      </div>

      <!-- Profile form -->
      <div class="rounded-lg border border-border bg-bg-card p-6">
        <form class="flex flex-col gap-4" @submit.prevent="saveProfile">
          <AppInput v-model="name" label="Имя" placeholder="Ваше имя" />
          <AppInput v-model="email" label="Email" type="email" placeholder="email" disabled />
          <AppButton type="submit" class="w-full" :loading="savingProfile">Сохранить</AppButton>
        </form>
      </div>

      <!-- Change password -->
      <div class="rounded-lg border border-border bg-bg-card p-6">
        <h2 class="mb-4 text-lg font-semibold text-text-primary">Сменить пароль</h2>
        <form class="flex flex-col gap-4" @submit.prevent="changePassword">
          <AppInput v-model="currentPassword" label="Текущий пароль" type="password" placeholder="••••••••" />
          <AppInput v-model="newPassword" label="Новый пароль" type="password" placeholder="••••••••" />
          <AppInput v-model="confirmPassword" label="Подтверждение" type="password" placeholder="••••••••" />
          <AppButton type="submit" class="w-full" :loading="savingPassword">Сменить пароль</AppButton>
        </form>
      </div>

      <!-- Logout -->
      <AppButton variant="secondary" class="w-full border-error/50 text-error hover:bg-error/10" @click="authStore.logout()">
        <LogOut :size="16" />
        Выйти из аккаунта
      </AppButton>
    </div>
  </div>
</template>
