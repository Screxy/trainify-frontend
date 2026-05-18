<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight, Clock, Dumbbell } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import type { RecentWorkoutSummary } from '@/shared/types'
import { AppBadge, AppButton } from '@/shared/ui'
import { translateMuscleGroup } from '@/shared/lib'

interface Props {
  workouts: RecentWorkoutSummary[]
}

const props = defineProps<Props>()

const gridWorkouts = computed(() => props.workouts.slice(0, 3))

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  })
}

function formatTonnage(t: number): string {
  if (t >= 1000) return `${(t / 1000).toFixed(1).replace('.', ',')} т`
  return `${Math.round(t)} кг`
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <h3 class="text-base font-semibold text-text-primary">Последние тренировки</h3>
      <RouterLink to="/workouts" class="text-sm text-accent transition-colors hover:text-accent-hover">
        Все тренировки →
      </RouterLink>
    </div>

    <div v-if="workouts.length === 0" class="rounded-lg bg-bg-card p-5 text-sm text-text-secondary">
      Тренировок пока нет
    </div>

    <!-- Desktop: 3-column grid -->
    <div v-if="workouts.length > 0" class="hidden md:grid md:grid-cols-3 md:gap-4">
      <div
        v-for="w in gridWorkouts"
        :key="w.id"
        class="flex flex-col gap-3 rounded-lg bg-bg-card p-5"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="text-sm font-semibold text-text-primary">{{ formatDate(w.date) }}</span>
          <AppBadge v-if="w.main_muscle_group" variant="default">
            {{ translateMuscleGroup(w.main_muscle_group) }}
          </AppBadge>
        </div>
        <span class="text-[13px] text-text-secondary">{{ w.title || 'Тренировка' }}</span>
        <div class="flex items-center gap-4 text-xs text-text-secondary">
          <span class="flex items-center gap-1">
            <Clock :size="12" />
            {{ w.duration_min }} мин
          </span>
          <span class="flex items-center gap-1">
            <Dumbbell :size="12" />
            {{ formatTonnage(w.tonnage) }}
          </span>
        </div>
        <RouterLink :to="`/workouts/${w.id}`">
          <AppButton variant="ghost" size="s" class="w-full">Подробнее</AppButton>
        </RouterLink>
      </div>
    </div>

    <!-- Mobile: vertical list -->
    <div v-if="workouts.length > 0" class="flex flex-col rounded-lg bg-bg-card md:hidden">
      <RouterLink
        v-for="(w, i) in workouts"
        :key="w.id"
        :to="`/workouts/${w.id}`"
        class="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-bg-hover"
        :class="i > 0 && 'border-t border-border'"
      >
        <div class="flex min-w-0 flex-col gap-1">
          <span class="truncate text-sm font-medium text-text-primary">
            {{ w.title || 'Тренировка' }}
          </span>
          <div class="flex items-center gap-3 text-xs text-text-secondary">
            <span>{{ formatDate(w.date) }}</span>
            <span class="flex items-center gap-1">
              <Clock :size="12" />
              {{ w.duration_min }} мин
            </span>
            <span class="flex items-center gap-1">
              <Dumbbell :size="12" />
              {{ formatTonnage(w.tonnage) }}
            </span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <AppBadge v-if="w.main_muscle_group" variant="default">
            {{ translateMuscleGroup(w.main_muscle_group) }}
          </AppBadge>
          <ChevronRight :size="16" class="text-text-secondary" />
        </div>
      </RouterLink>
    </div>
  </div>
</template>
