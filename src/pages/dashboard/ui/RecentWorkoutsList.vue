<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import type { WorkoutSession } from '@/shared/types'
import { AppBadge } from '@/shared/ui'

interface Props {
  workouts: WorkoutSession[]
}

defineProps<Props>()

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  })
}
</script>

<template>
  <div class="rounded-lg border border-border bg-bg-card">
    <div class="flex items-center justify-between px-5 py-4">
      <h3 class="text-base font-semibold text-text-primary">Последние тренировки</h3>
      <RouterLink to="/workouts" class="text-sm text-accent hover:text-accent-hover transition-colors">
        Все →
      </RouterLink>
    </div>
    <div v-if="workouts.length === 0" class="px-5 pb-5 text-sm text-text-secondary">
      Тренировок пока нет
    </div>
    <RouterLink
      v-for="w in workouts"
      :key="w.id"
      :to="`/workouts/${w.id}`"
      class="flex items-center justify-between border-t border-border px-5 py-3 transition-colors hover:bg-bg-hover"
    >
      <div class="flex flex-col gap-0.5">
        <span class="text-sm font-medium text-text-primary">{{ w.title || 'Тренировка' }}</span>
        <span class="text-xs text-text-secondary">{{ formatDate(w.date) }}</span>
      </div>
      <div class="flex items-center gap-2">
        <AppBadge :variant="w.completed_at ? 'success' : 'default'">
          {{ w.completed_at ? 'Завершена' : 'В процессе' }}
        </AppBadge>
        <ChevronRight :size="16" class="text-text-secondary" />
      </div>
    </RouterLink>
  </div>
</template>
