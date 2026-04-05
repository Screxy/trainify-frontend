<script setup lang="ts">
import { onMounted } from 'vue'
import { Users, Dumbbell, Activity } from 'lucide-vue-next'
import { useAdminStore } from '@/features/admin'

const adminStore = useAdminStore()

onMounted(() => {
  adminStore.fetchStats()
})
</script>

<template>
  <div class="flex flex-col gap-6 p-4 md:p-8">
    <h1 class="text-xl font-bold text-text-primary md:text-[32px]">Статистика платформы</h1>

    <div v-if="adminStore.loading" class="py-12 text-center text-text-secondary">Загрузка...</div>
    <template v-else-if="adminStore.stats">
      <div class="grid gap-4 md:grid-cols-3">
        <div class="flex flex-col gap-2 rounded-lg border border-border bg-bg-card p-6">
          <Users :size="20" class="text-accent" />
          <span class="text-3xl font-bold text-text-primary">{{ adminStore.stats.total_users }}</span>
          <span class="text-sm text-text-secondary">Всего пользователей</span>
        </div>
        <div class="flex flex-col gap-2 rounded-lg border border-border bg-bg-card p-6">
          <Dumbbell :size="20" class="text-info" />
          <span class="text-3xl font-bold text-text-primary">{{ adminStore.stats.total_workouts }}</span>
          <span class="text-sm text-text-secondary">Всего тренировок</span>
        </div>
        <div class="flex flex-col gap-2 rounded-lg border border-border bg-bg-card p-6">
          <Activity :size="20" class="text-warning" />
          <span class="text-3xl font-bold text-text-primary">{{ adminStore.stats.active_today }}</span>
          <span class="text-sm text-text-secondary">Активных сегодня</span>
        </div>
      </div>

      <!-- Activity placeholder -->
      <div class="rounded-lg border border-border bg-bg-card p-6">
        <h3 class="mb-4 text-base font-semibold text-text-primary">Активность</h3>
        <div class="flex h-[260px] items-center justify-center text-sm text-text-secondary">
          График активности будет доступен после накопления данных
        </div>
      </div>
    </template>
  </div>
</template>
