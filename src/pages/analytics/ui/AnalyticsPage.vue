<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { BarChart3, TrendingUp } from 'lucide-vue-next'
import { useAnalyticsStore } from '@/features/analytics'
import { useExerciseStore } from '@/entities/exercise'
import { AppSelect } from '@/shared/ui'
import PeriodTabs from './PeriodTabs.vue'
import PersonalRecordsTable from './PersonalRecordsTable.vue'

const analyticsStore = useAnalyticsStore()
const exerciseStore = useExerciseStore()

const selectedExercise = ref('')
const period = ref<'week' | 'month' | 'year'>('month')

const exerciseOptions = ref<{ value: string; label: string }[]>([])

onMounted(async () => {
  await exerciseStore.fetchExercises()
  exerciseOptions.value = exerciseStore.exercises.map((e) => ({
    value: String(e.id),
    label: e.name,
  }))
  analyticsStore.fetchRecords()
})

watch([selectedExercise, period], ([exId, p]) => {
  if (exId) {
    analyticsStore.fetchProgress(Number(exId), p)
  }
})
</script>

<template>
  <div class="flex flex-col gap-6 p-4 md:p-8">
    <h1 class="text-xl font-bold text-text-primary md:text-[32px]">Аналитика</h1>

    <!-- Filters -->
    <div class="flex flex-col gap-3 md:flex-row md:items-end">
      <div class="w-full md:w-72">
        <AppSelect
          v-model="selectedExercise"
          label="Упражнение"
          :options="exerciseOptions"
          placeholder="Выберите упражнение"
        />
      </div>
      <PeriodTabs v-model="period" />
    </div>

    <!-- Charts -->
    <div class="grid gap-4 md:grid-cols-2">
      <div class="flex flex-col gap-3 rounded-lg border border-border bg-bg-card p-5">
        <div class="flex items-center gap-2">
          <TrendingUp :size="16" class="text-accent" />
          <span class="text-sm font-semibold text-text-primary">Максимальный вес</span>
        </div>
        <div class="flex h-[200px] items-center justify-center text-text-secondary">
          <div v-if="!selectedExercise" class="text-center text-sm">Выберите упражнение</div>
          <div v-else-if="analyticsStore.progressData.length === 0" class="text-center text-sm">Нет данных</div>
          <div v-else class="flex h-full w-full items-end gap-1 px-2 pb-2">
            <div
              v-for="(point, i) in analyticsStore.progressData"
              :key="i"
              class="flex-1 rounded-t bg-accent/60"
              :style="{ height: `${(point.max_weight / Math.max(...analyticsStore.progressData.map(p => p.max_weight))) * 100}%` }"
              :title="`${point.date}: ${point.max_weight} кг`"
            />
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-3 rounded-lg border border-border bg-bg-card p-5">
        <div class="flex items-center gap-2">
          <BarChart3 :size="16" class="text-info" />
          <span class="text-sm font-semibold text-text-primary">Объём</span>
        </div>
        <div class="flex h-[200px] items-center justify-center text-text-secondary">
          <div v-if="!selectedExercise" class="text-center text-sm">Выберите упражнение</div>
          <div v-else-if="analyticsStore.progressData.length === 0" class="text-center text-sm">Нет данных</div>
          <div v-else class="flex h-full w-full items-end gap-1 px-2 pb-2">
            <div
              v-for="(point, i) in analyticsStore.progressData"
              :key="i"
              class="flex-1 rounded-t bg-info/60"
              :style="{ height: `${(point.volume / Math.max(...analyticsStore.progressData.map(p => p.volume))) * 100}%` }"
              :title="`${point.date}: ${point.volume} кг`"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Records -->
    <PersonalRecordsTable :records="analyticsStore.records" />
  </div>
</template>
