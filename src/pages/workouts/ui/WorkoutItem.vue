<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import type { WorkoutSession } from '@/shared/types'
import { AppBadge } from '@/shared/ui'

interface Props {
  workout: WorkoutSession
}

defineProps<Props>()

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDuration(mins?: number) {
  if (!mins) return '—'
  return `${mins} мин`
}
</script>

<template>
  <RouterLink
    :to="`/workouts/${workout.id}`"
    class="flex items-center justify-between rounded-lg border border-border bg-bg-card px-5 py-4 transition-colors hover:bg-bg-hover"
  >
    <div class="flex flex-col gap-1">
      <span class="font-medium text-text-primary">{{ workout.title || 'Тренировка' }}</span>
      <div class="flex items-center gap-3 text-xs text-text-secondary">
        <span>{{ formatDate(workout.date) }}</span>
        <span>{{ formatDuration(workout.duration) }}</span>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <AppBadge :variant="workout.completed_at ? 'success' : 'default'">
        {{ workout.completed_at ? 'Завершена' : 'В процессе' }}
      </AppBadge>
      <ChevronRight :size="16" class="text-text-secondary" />
    </div>
  </RouterLink>
</template>
