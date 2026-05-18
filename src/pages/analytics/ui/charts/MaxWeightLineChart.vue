<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartOptions,
} from 'chart.js'
import type { ProgressPoint } from '@/shared/types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

interface Props {
  points: ProgressPoint[]
}

const props = defineProps<Props>()

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })
}

const chartData = computed(() => ({
  labels: props.points.map((p) => formatDate(p.date)),
  datasets: [
    {
      label: 'Макс. вес, кг',
      data: props.points.map((p) => p.max_weight),
      borderColor: '#22C55E',
      backgroundColor: 'rgba(34,197,94,0.18)',
      pointBackgroundColor: '#22C55E',
      pointBorderColor: '#22C55E',
      pointRadius: 3,
      fill: true,
      tension: 0.35,
    },
  ],
}))

const yMin = computed(() => {
  const vals = props.points.map((p) => p.max_weight)
  if (vals.length === 0) return 0
  return Math.max(0, Math.floor(Math.min(...vals) * 0.9))
})

const chartOptions = computed<ChartOptions<'line'>>(() => ({
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
      ticks: { color: '#94A3B8', font: { size: 11 }, maxTicksLimit: 5, padding: 8 },
    },
  },
}))
</script>

<template>
  <div class="relative h-[200px] w-full">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
