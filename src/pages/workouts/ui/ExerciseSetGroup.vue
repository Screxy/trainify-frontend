<script setup lang="ts">
import type { TrainingSetResponse } from '@/shared/types'

interface Props {
  exerciseName: string
  sets: TrainingSetResponse[]
}

defineProps<Props>()
</script>

<template>
  <div class="rounded-lg border border-border bg-bg-card">
    <div class="px-5 py-3 font-medium text-text-primary">{{ exerciseName }}</div>
    <table class="w-full text-sm">
      <thead>
        <tr class="border-t border-border text-left text-xs text-text-secondary">
          <th class="px-5 py-2 font-medium">Подход</th>
          <th class="px-5 py-2 font-medium">Вес</th>
          <th class="px-5 py-2 font-medium">Повторения</th>
          <th class="px-5 py-2 font-medium"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(s, i) in sets" :key="s.id" class="border-t border-border">
          <td class="px-5 py-2 text-text-primary">{{ i + 1 }}</td>
          <td class="px-5 py-2 text-text-primary">{{ s.weight ?? '—' }} кг</td>
          <td class="px-5 py-2 text-text-primary">{{ s.reps }}</td>
          <td class="px-5 py-2">
            <span
              v-if="s.is_warmup"
              class="rounded bg-warning/20 px-1.5 py-0.5 text-[11px] font-medium text-warning"
            >
              Разм.
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
