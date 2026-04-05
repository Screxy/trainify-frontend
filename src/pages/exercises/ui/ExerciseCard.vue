<script setup lang="ts">
import type { Exercise } from '@/shared/types'
import { AppBadge } from '@/shared/ui'

interface Props {
  exercise: Exercise
}

defineProps<Props>()

const typeLabels: Record<string, string> = {
  weights: 'Свободные веса',
  bodyweight: 'Своё тело',
  machine: 'Тренажёр',
  cardio: 'Кардио',
}
</script>

<template>
  <div class="flex flex-col gap-3 rounded-lg border border-border bg-bg-card p-4">
    <div class="flex items-start justify-between">
      <span class="font-medium text-text-primary">{{ exercise.name }}</span>
      <AppBadge>{{ typeLabels[exercise.type] ?? exercise.type }}</AppBadge>
    </div>
    <div class="flex flex-wrap gap-1">
      <span
        v-for="mg in exercise.muscle_groups"
        :key="mg"
        class="rounded bg-bg-hover px-2 py-0.5 text-[11px] text-text-secondary"
      >
        {{ mg }}
      </span>
    </div>
  </div>
</template>
