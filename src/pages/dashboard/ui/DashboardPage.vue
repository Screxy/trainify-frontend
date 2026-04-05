<script setup lang="ts">
import { onMounted } from 'vue'
import { Dumbbell, Flame, Zap, Weight } from 'lucide-vue-next'
import { useWorkoutStore } from '@/entities/workout'
import MetricCard from './MetricCard.vue'
import ProgressChart from './ProgressChart.vue'
import AiRecommendation from './AiRecommendation.vue'
import RecentWorkoutsList from './RecentWorkoutsList.vue'

const workoutStore = useWorkoutStore()

onMounted(() => {
  workoutStore.fetchWorkouts({ limit: 5 })
})
</script>

<template>
  <div class="flex flex-col gap-6 p-4 md:p-8">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-text-primary md:text-[32px]">Dashboard</h1>
      <p class="mt-1 text-sm text-text-secondary">Обзор ваших тренировок</p>
    </div>

    <!-- Metrics -->
    <div class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      <MetricCard :icon="Dumbbell" value="12" label="Всего тренировок" />
      <MetricCard :icon="Flame" value="4" label="На этой неделе" icon-color="text-warning" />
      <MetricCard :icon="Zap" value="5 дней" label="Текущая серия" icon-color="text-info" />
      <MetricCard :icon="Weight" value="100 кг" label="Макс. вес" />
    </div>

    <!-- Charts + AI -->
    <div class="grid gap-4 md:grid-cols-[1fr_320px]">
      <ProgressChart />
      <AiRecommendation />
    </div>

    <!-- Recent workouts -->
    <RecentWorkoutsList :workouts="workoutStore.workouts" />
  </div>
</template>
