<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { BarChart3, TrendingUp } from 'lucide-vue-next'
import { analyticsApi } from '@/features/analytics'
import { useExerciseStore } from '@/entities/exercise'
import { AppSelect } from '@/shared/ui'
import type { ProgressPoint } from '@/shared/types'
import ProgressBarChart from './charts/ProgressBarChart.vue'

interface Props {
  exerciseId?: number
  exerciseName?: string
  deltaKg?: number
}

type Period = 'week' | 'month' | 'year'

const props = defineProps<Props>()

const exerciseStore = useExerciseStore()

const selectedExerciseId = ref<string>(props.exerciseId != null ? String(props.exerciseId) : '')
const selectedPeriod = ref<Period>('month')

const points = ref<ProgressPoint[]>([])
const loading = ref(false)

const periodOptions: { value: Period; label: string }[] = [
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'year', label: 'Год' },
]

const periodLabel = computed(() => {
  switch (selectedPeriod.value) {
    case 'week':
      return 'последние 7 дней'
    case 'year':
      return 'последний год'
    default:
      return 'последние 30 дней'
  }
})

const exerciseOptions = computed(() =>
  exerciseStore.exercises.map((e) => ({ value: String(e.id), label: e.name })),
)

const selectedIdNumber = computed(() =>
  selectedExerciseId.value ? Number(selectedExerciseId.value) : null,
)

const selectedExerciseName = computed(() => {
  if (selectedIdNumber.value === props.exerciseId && props.exerciseName) {
    return props.exerciseName
  }
  return (
    exerciseStore.exercises.find((e) => e.id === selectedIdNumber.value)?.name ?? ''
  )
})

const displayDelta = computed(() =>
  selectedIdNumber.value === props.exerciseId ? props.deltaKg : undefined,
)

onMounted(() => {
  if (exerciseStore.exercises.length === 0) {
    exerciseStore.fetchExercises()
  }
})

watch(
  () => props.exerciseId,
  (id) => {
    if (!selectedExerciseId.value && id != null) {
      selectedExerciseId.value = String(id)
    }
  },
)

watch(
  [selectedIdNumber, selectedPeriod],
  async ([id, period]) => {
    if (id == null) {
      points.value = []
      return
    }
    loading.value = true
    try {
      const { data } = await analyticsApi.getProgress(id, period)
      points.value = data
    } catch {
      points.value = []
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)

function deltaLabel(d: number): string {
  if (d > 0) return `+${d} кг`
  return `${d} кг`
}
</script>

<template>
  <div class="flex flex-col gap-5 rounded-lg bg-bg-card p-6">
    <!-- Header: title + period tabs -->
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="flex flex-col gap-1">
        <h3 class="text-base font-semibold text-text-primary">Прогресс рабочего веса</h3>
        <div v-if="selectedExerciseName" class="flex items-center gap-2 text-xs text-text-secondary">
          <TrendingUp v-if="displayDelta !== undefined && displayDelta > 0" :size="12" class="text-accent" />
          <span>{{ selectedExerciseName }}</span>
          <span>·</span>
          <span>{{ periodLabel }}</span>
          <template v-if="displayDelta !== undefined">
            <span>·</span>
            <span
              :class="displayDelta > 0 ? 'text-accent' : displayDelta < 0 ? 'text-error' : 'text-text-secondary'"
            >
              {{ deltaLabel(displayDelta) }}
            </span>
          </template>
        </div>
      </div>
      <div class="flex items-center gap-1 rounded-lg bg-bg-input p-1">
        <button
          v-for="opt in periodOptions"
          :key="opt.value"
          type="button"
          class="h-7 rounded-md px-3 text-xs font-medium transition-colors"
          :class="selectedPeriod === opt.value
            ? 'bg-accent text-bg'
            : 'text-text-secondary hover:text-text-primary'"
          @click="selectedPeriod = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <!-- Exercise selector -->
    <div v-if="exerciseStore.exercises.length > 0" class="max-w-[260px]">
      <AppSelect
        v-model="selectedExerciseId"
        label="Упражнение"
        :options="exerciseOptions"
        placeholder="Выберите упражнение"
      />
    </div>

    <!-- Chart area -->
    <div v-if="!selectedExerciseId" class="flex h-[200px] items-center justify-center">
      <div class="flex flex-col items-center gap-2 text-text-secondary">
        <BarChart3 :size="32" />
        <span class="text-sm">График доступен после нескольких тренировок</span>
      </div>
    </div>

    <div v-else-if="loading" class="flex h-[200px] items-center justify-center text-sm text-text-secondary">
      Загрузка…
    </div>

    <div v-else-if="points.length === 0" class="flex h-[200px] items-center justify-center">
      <div class="flex flex-col items-center gap-2 text-text-secondary">
        <BarChart3 :size="32" />
        <span class="text-sm">Недостаточно данных</span>
      </div>
    </div>

    <ProgressBarChart v-else :points="points" />
  </div>
</template>
