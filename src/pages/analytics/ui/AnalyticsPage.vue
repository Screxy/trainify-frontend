<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { BarChart3, TrendingUp } from 'lucide-vue-next'
import { useAnalyticsStore } from '@/features/analytics'
import { useExerciseStore } from '@/entities/exercise'
import { AppSelect } from '@/shared/ui'
import PeriodTabs from './PeriodTabs.vue'
import PersonalRecordsTable from './PersonalRecordsTable.vue'
import MaxWeightLineChart from './charts/MaxWeightLineChart.vue'
import ProgressBarChart from '@/pages/dashboard/ui/charts/ProgressBarChart.vue'

const analyticsStore = useAnalyticsStore()
const exerciseStore = useExerciseStore()

const selectedExerciseId = ref<string>('')
const period = ref<'week' | 'month' | 'year'>('month')

const exerciseOptions = computed(() =>
  exerciseStore.exercises.map((e) => ({ value: String(e.id), label: e.name })),
)

onMounted(async () => {
  if (exerciseStore.exercises.length === 0) {
    await exerciseStore.fetchExercises()
  }
  if (exerciseStore.exercises.length > 0 && !selectedExerciseId.value) {
    selectedExerciseId.value = String(exerciseStore.exercises[0].id)
  }
  analyticsStore.fetchRecords()
})

watch(
  [selectedExerciseId, period],
  ([id, p]) => {
    if (id) analyticsStore.fetchProgress(Number(id), p)
  },
  { immediate: true },
)

const hasData = computed(() => analyticsStore.progressData.length > 0)
</script>

<template>
  <div class="flex flex-col gap-6 p-4 md:p-8">
    <h1 class="text-2xl font-bold text-text-primary md:text-[32px]">Аналитика</h1>

    <!-- Filters -->
    <div class="flex flex-col gap-3 md:flex-row md:items-end md:gap-4">
      <div class="w-full md:w-[280px]">
        <AppSelect
          v-model="selectedExerciseId"
          label="Упражнение"
          :options="exerciseOptions"
          placeholder="Выберите упражнение"
        />
      </div>
      <PeriodTabs v-model="period" />
    </div>

    <!-- Charts -->
    <div class="grid gap-4 md:grid-cols-2">
      <!-- Max weight (line) -->
      <div class="flex flex-col gap-4 rounded-lg bg-bg-card p-6">
        <div class="flex items-center gap-2">
          <TrendingUp :size="16" class="text-accent" />
          <h3 class="text-base font-semibold text-text-primary">Динамика рабочего веса</h3>
        </div>
        <div v-if="!selectedExerciseId" class="flex h-[200px] items-center justify-center text-sm text-text-secondary">
          Выберите упражнение
        </div>
        <div
          v-else-if="analyticsStore.loading && !hasData"
          class="flex h-[200px] items-center justify-center text-sm text-text-secondary"
        >
          Загрузка…
        </div>
        <div v-else-if="!hasData" class="flex h-[200px] items-center justify-center text-sm text-text-secondary">
          Нет данных
        </div>
        <MaxWeightLineChart v-else :points="analyticsStore.progressData" />
      </div>

      <!-- Volume (bars) -->
      <div class="flex flex-col gap-4 rounded-lg bg-bg-card p-6">
        <div class="flex items-center gap-2">
          <BarChart3 :size="16" class="text-accent-secondary" />
          <h3 class="text-base font-semibold text-text-primary">Объём нагрузки</h3>
        </div>
        <div v-if="!selectedExerciseId" class="flex h-[200px] items-center justify-center text-sm text-text-secondary">
          Выберите упражнение
        </div>
        <div
          v-else-if="analyticsStore.loading && !hasData"
          class="flex h-[200px] items-center justify-center text-sm text-text-secondary"
        >
          Загрузка…
        </div>
        <div v-else-if="!hasData" class="flex h-[200px] items-center justify-center text-sm text-text-secondary">
          Нет данных
        </div>
        <ProgressBarChart v-else :points="analyticsStore.progressData" metric="volume" />
      </div>
    </div>

    <!-- Personal records -->
    <PersonalRecordsTable :records="analyticsStore.records" />
  </div>
</template>
