<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
  type ChartOptions,
} from 'chart.js'
import type { ProgressPoint } from '@/shared/types'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

type Metric = 'max_weight' | 'volume'

interface Props {
  points: ProgressPoint[]
  metric?: Metric
}

const props = withDefaults(defineProps<Props>(), {
  metric: 'max_weight',
})

function formatDate(d: string): string {
  const date = new Date(d)
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })
}

const values = computed(() => props.points.map((p) => p[props.metric]))

const colors = computed(() => {
  const lastIdx = values.value.length - 1
  return values.value.map((_, i) =>
    i === lastIdx && lastIdx > 0 ? '#38BDF8' : '#22C55E',
  )
})

const chartData = computed(() => ({
  labels: props.points.map((p) => formatDate(p.date)),
  datasets: [
    {
      label: props.metric === 'max_weight' ? 'Макс. вес, кг' : 'Объём, кг',
      data: values.value,
      backgroundColor: colors.value,
      borderRadius: 4,
      borderSkipped: false,
      maxBarThickness: 40,
    },
  ],
}))

const yMin = computed(() => {
  if (values.value.length === 0) return 0
  const min = Math.min(...values.value)
  return Math.max(0, Math.floor(min * 0.9))
})

const chartOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1A1D27',
      titleColor: '#F1F5F9',
      bodyColor: '#94A3B8',
      borderColor: '#2D3748',
      borderWidth: 1,
      padding: 10,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { color: '#94A3B8', font: { size: 11 } },
    },
    y: {
      min: yMin.value,
      grid: { color: '#2D374844', drawTicks: false },
      border: { display: false },
      ticks: {
        color: '#94A3B8',
        font: { size: 11 },
        maxTicksLimit: 5,
        padding: 8,
      },
    },
  },
}))
</script>

<template>
  <div class="relative h-[200px] w-full">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>
