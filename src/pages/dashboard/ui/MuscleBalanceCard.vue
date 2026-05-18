<script setup lang="ts">
import { computed } from 'vue'
import { PieChart } from 'lucide-vue-next'
import type { MuscleBalance, MuscleGroupKey } from '@/shared/types'
import { muscleNames } from '@/shared/lib'
import { AppBadge } from '@/shared/ui'

interface Props {
  balance: MuscleBalance[]
}

const props = defineProps<Props>()

const order: MuscleGroupKey[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'glutes']
const BAR_AREA_HEIGHT = 160
const LOW_THRESHOLD = 10

const rows = computed(() => {
  const map = new Map(props.balance.map((b) => [b.group, b.percent]))
  return order.map((group) => ({
    group,
    label: muscleNames[group],
    percent: Math.round(map.get(group) ?? 0),
  }))
})

const maxPercent = computed(() => Math.max(1, ...rows.value.map((r) => r.percent)))

const weakestGroup = computed(() => {
  if (rows.value.length === 0) return null
  let weakest = rows.value[0]
  for (const r of rows.value) if (r.percent < weakest.percent) weakest = r
  return weakest.percent < LOW_THRESHOLD ? weakest : null
})

function barHeight(percent: number): string {
  return `${Math.max(4, (percent / maxPercent.value) * BAR_AREA_HEIGHT)}px`
}

function isLow(percent: number): boolean {
  return percent < LOW_THRESHOLD
}

function opacityFor(percent: number): number {
  if (isLow(percent)) return 1
  const ratio = percent / maxPercent.value
  if (ratio > 0.9) return 1
  if (ratio > 0.7) return 0.75
  if (ratio > 0.5) return 0.6
  return 0.45
}
</script>

<template>
  <div class="flex flex-col gap-5 rounded-lg bg-bg-card p-6">
    <div class="flex items-center gap-3">
      <PieChart :size="20" class="text-accent" />
      <h3 class="flex-1 text-base font-semibold text-text-primary">
        Баланс нагрузки за 30 дней
      </h3>
      <AppBadge v-if="weakestGroup" variant="warning">
        Подтяни {{ weakestGroup.label.toLowerCase() }}
      </AppBadge>
    </div>
    <div class="flex items-end gap-3 md:gap-4" :style="{ height: `${BAR_AREA_HEIGHT + 40}px` }">
      <div
        v-for="row in rows"
        :key="row.group"
        class="flex flex-1 flex-col items-center gap-2"
      >
        <div
          class="w-full rounded-t-md"
          :class="isLow(row.percent) ? 'bg-warning' : 'bg-accent'"
          :style="{ height: barHeight(row.percent), opacity: opacityFor(row.percent) }"
        />
        <div class="flex flex-col items-center text-center">
          <span class="text-xs text-text-secondary">{{ row.label }}</span>
          <span class="text-xs font-semibold text-text-primary tabular-nums">{{ row.percent }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>
