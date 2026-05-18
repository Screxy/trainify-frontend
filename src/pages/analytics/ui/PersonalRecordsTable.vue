<script setup lang="ts">
import { Trophy } from 'lucide-vue-next'
import type { PersonalRecord } from '@/shared/types'

interface Props {
  records: PersonalRecord[]
}

defineProps<Props>()
</script>

<template>
  <div class="flex flex-col gap-4 rounded-lg bg-bg-card p-6">
    <div class="flex items-center gap-2">
      <Trophy :size="18" class="text-warning" />
      <h3 class="text-base font-semibold text-text-primary">Личные рекорды</h3>
    </div>

    <div v-if="records.length === 0" class="py-6 text-center text-sm text-text-secondary">
      Рекордов пока нет
    </div>

    <div v-else class="flex flex-col">
      <!-- Header (md+) -->
      <div class="hidden h-10 items-center gap-4 rounded bg-bg-input px-4 text-xs font-medium text-text-secondary md:flex">
        <span class="flex-1">Упражнение</span>
        <span class="w-32 text-right">Макс. вес</span>
        <span class="w-32 text-right">Повторения</span>
      </div>
      <!-- Rows -->
      <div
        v-for="(r, i) in records"
        :key="r.exercise_id"
        class="flex items-center gap-4 px-4 py-3 text-sm"
        :class="i > 0 && 'border-t border-border'"
      >
        <span class="flex-1 truncate text-text-primary">{{ r.exercise_name }}</span>
        <span class="w-32 text-right font-semibold text-accent tabular-nums">
          {{ r.max_weight }} кг
        </span>
        <span class="w-32 text-right text-text-secondary tabular-nums">
          {{ r.max_reps }}
        </span>
      </div>
    </div>
  </div>
</template>
