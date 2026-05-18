<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { LogOut, User } from 'lucide-vue-next'
import { AppInput, AppButton } from '@/shared/ui'
import { useAuthStore } from '@/features/auth'
import { useProfileStore } from '@/features/profile'
import { useToast } from '@/shared/lib/useToast'

const authStore = useAuthStore()
const profileStore = useProfileStore()
const toast = useToast()

const name = ref('')
const email = ref('')

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const savingProfile = ref(false)
const savingPassword = ref(false)

onMounted(async () => {
  await profileStore.fetchProfile()
})

watch(
  () => profileStore.profile,
  (p) => {
    if (p) {
      name.value = p.name ?? ''
      email.value = p.email ?? ''
    }
  },
  { immediate: true },
)

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

function handleLogout() {
  authStore.logout()
}
</script>

<template>
  <div class="flex justify-center p-4 md:p-8">
    <div class="flex w-full max-w-[560px] flex-col gap-6 md:rounded-lg md:bg-bg-card md:p-8">
      <!-- Avatar -->
      <div class="flex justify-center">
        <div class="flex h-20 w-20 items-center justify-center rounded-full border-2 border-accent bg-bg-input md:h-24 md:w-24">
          <User :size="36" class="text-text-secondary" />
        </div>
      </div>

      <h1 class="text-center text-2xl font-bold text-text-primary">Профиль</h1>

      <!-- Profile form -->
      <form class="flex flex-col gap-4" @submit.prevent="saveProfile">
        <AppInput v-model="name" label="Имя" placeholder="Ваше имя" />
        <AppInput v-model="email" label="Email" type="email" placeholder="email@example.com" disabled />
        <AppButton type="submit" size="m" class="w-full" :loading="savingProfile">
          Сохранить изменения
        </AppButton>
      </form>

      <div class="h-px bg-border" />

      <!-- Change password -->
      <h2 class="text-lg font-semibold text-text-primary">Сменить пароль</h2>
      <form class="flex flex-col gap-4" @submit.prevent="changePassword">
        <AppInput
          v-model="currentPassword"
          label="Старый пароль"
          type="password"
          placeholder="••••••••"
        />
        <AppInput
          v-model="newPassword"
          label="Новый пароль"
          type="password"
          placeholder="••••••••"
        />
        <AppInput
          v-model="confirmPassword"
          label="Подтвердите пароль"
          type="password"
          placeholder="••••••••"
        />
        <AppButton type="submit" variant="secondary" size="m" class="w-full" :loading="savingPassword">
          Сменить пароль
        </AppButton>
      </form>

      <div class="h-px bg-border" />

      <!-- Logout -->
      <button
        type="button"
        class="flex h-11 items-center justify-center gap-2 rounded-lg border border-error bg-error/10 text-sm font-semibold text-error transition-colors hover:bg-error/20"
        @click="handleLogout"
      >
        <LogOut :size="18" />
        Выйти
      </button>
    </div>
  </div>
</template>
