<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { Dumbbell, Flame, TrendingUp, Trophy } from 'lucide-vue-next'
import { useDashboardStore, useAiInsightsStore } from '@/features/analytics'
import MetricCard from './MetricCard.vue'
import ProgressChart from './ProgressChart.vue'
import AiRecommendation from './AiRecommendation.vue'
import RecentWorkoutsList from './RecentWorkoutsList.vue'
import MuscleBalanceCard from './MuscleBalanceCard.vue'

const dashboard = useDashboardStore()
const ai = useAiInsightsStore()

onMounted(() => {
  dashboard.fetchDashboard()
  ai.fetchLatest()
})

onBeforeUnmount(() => {
  ai.stopPolling()
})

const todayLabel = computed(() =>
  new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  }),
)

const isInitialLoading = computed(() => dashboard.loading && !dashboard.data)

const mainLiftValue = computed(() => {
  const ml = dashboard.data?.main_lift
  if (!ml) return '—'
  const sign = ml.delta_kg > 0 ? '+' : ''
  return `${sign}${ml.delta_kg} кг`
})

const mainLiftLabel = computed(() =>
  dashboard.data?.main_lift?.exercise_name ?? 'Основной жим за 30 дней',
)
</script>

<template>
  <div class="flex flex-col gap-6 p-4 md:p-8">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-text-primary md:text-[32px]">Главная</h1>
      <p class="mt-1 text-sm capitalize text-text-secondary">{{ todayLabel }}</p>
    </div>

    <!-- Skeleton state -->
    <template v-if="isInitialLoading">
      <div class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <div v-for="i in 4" :key="i" class="h-[104px] animate-pulse rounded-lg bg-bg-card" />
      </div>
      <div class="grid gap-4 md:grid-cols-[1fr_320px]">
        <div class="h-[280px] animate-pulse rounded-lg bg-bg-card" />
        <div class="h-[280px] animate-pulse rounded-lg bg-bg-card" />
      </div>
      <div class="h-[260px] animate-pulse rounded-lg bg-bg-card" />
      <div class="h-[200px] animate-pulse rounded-lg bg-bg-card" />
    </template>

    <template v-else>
      <!-- Metrics -->
      <div class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <MetricCard
          :icon="Dumbbell"
          :value="dashboard.data?.workouts_this_month ?? 0"
          label="Тренировок за месяц"
        />
        <MetricCard
          :icon="TrendingUp"
          :value="mainLiftValue"
          :label="mainLiftLabel"
          icon-color="text-accent-secondary"
        />
        <MetricCard
          :icon="Flame"
          :value="`${dashboard.data?.streak_days ?? 0} дн`"
          label="Серия"
          icon-color="text-warning"
        />
        <MetricCard
          :icon="Trophy"
          :value="dashboard.data?.prs_this_month ?? 0"
          label="PR за месяц"
          icon-color="text-error"
        />
      </div>

      <!-- Chart + AI -->
      <div class="grid gap-4 md:grid-cols-[1fr_320px]">
        <ProgressChart
          :exercise-id="dashboard.data?.main_lift?.exercise_id"
          :exercise-name="dashboard.data?.main_lift?.exercise_name"
          :delta-kg="dashboard.data?.main_lift?.delta_kg"
        />
        <AiRecommendation />
      </div>

      <!-- Muscle balance -->
      <MuscleBalanceCard :balance="dashboard.data?.muscle_balance ?? []" />

      <!-- Recent workouts -->
      <RecentWorkoutsList :workouts="dashboard.data?.recent_workouts ?? []" />
    </template>
  </div>
</template>
