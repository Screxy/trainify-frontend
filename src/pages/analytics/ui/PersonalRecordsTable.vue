<script setup lang="ts">
import type { PersonalRecord } from '@/shared/types'

interface Props {
  records: PersonalRecord[]
}

defineProps<Props>()
</script>

<template>
  <div class="rounded-lg border border-border bg-bg-card">
    <div class="px-5 py-4">
      <h3 class="text-base font-semibold text-text-primary">Личные рекорды</h3>
    </div>
    <table class="w-full text-sm">
      <thead>
        <tr class="border-t border-border text-left text-xs text-text-secondary">
          <th class="px-5 py-2 font-medium">Упражнение</th>
          <th class="px-5 py-2 font-medium">Макс. вес</th>
          <th class="px-5 py-2 font-medium">Макс. повторения</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in records" :key="r.exercise_id" class="border-t border-border">
          <td class="px-5 py-3 text-text-primary">{{ r.exercise_name }}</td>
          <td class="px-5 py-3 text-text-primary">{{ r.max_weight }} кг</td>
          <td class="px-5 py-3 text-text-primary">{{ r.max_reps }}</td>
        </tr>
        <tr v-if="records.length === 0">
          <td colspan="3" class="px-5 py-6 text-center text-text-secondary">Рекордов пока нет</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
