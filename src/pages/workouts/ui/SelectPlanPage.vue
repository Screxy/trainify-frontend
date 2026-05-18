<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ChevronRight, Flame, Zap, HeartPulse } from 'lucide-vue-next'
import { usePlanStore } from '@/entities/plan'
import { useActiveWorkoutStore } from '@/entities/workout'
import { useToast } from '@/shared/lib/useToast'

const route = useRoute()
const router = useRouter()
const planStore = usePlanStore()
const activeWorkoutStore = useActiveWorkoutStore()
const toast = useToast()
const loading = ref(false)

onMounted(() => {
  planStore.fetchPlans()
})

const planIcons = [Flame, Zap, HeartPulse]
const planColors = ['text-accent', 'text-info', 'text-warning']
const planBgs = ['bg-accent/[0.13]', 'bg-info/[0.13]', 'bg-warning/[0.13]']

async function selectPlan(planId: number) {
  loading.value = true
  try {
    await planStore.fetchPlan(planId)
    if (!planStore.currentPlan) return

    const weight = route.query.weight ? Number(route.query.weight) : undefined
    const notes = route.query.notes ? String(route.query.notes) : undefined
    const title = route.query.title ? String(route.query.title) : undefined
    await activeWorkoutStore.startFromPlan(planStore.currentPlan, weight, notes, title)
    router.push('/workouts/active')
  } catch {
    toast.error('Не удалось начать тренировку')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col">
    <!-- Header -->
    <div class="flex h-[52px] items-center gap-3 px-5">
      <button class="text-text-primary" @click="router.back()">
        <ArrowLeft :size="24" />
      </button>
      <span class="text-lg font-semibold text-text-primary">Выбор плана</span>
    </div>

    <!-- Plan list -->
    <div class="flex flex-col gap-3 px-5 py-4">
      <div v-if="planStore.loading" class="py-12 text-center text-text-secondary">Загрузка...</div>
      <div v-else-if="planStore.plans.length === 0" class="py-12 text-center text-sm text-text-secondary">
        У вас нет планов. Создайте план в разделе «Планы».
      </div>
      <button
        v-for="(plan, i) in planStore.plans"
        :key="plan.id"
        :disabled="loading"
        class="flex items-center gap-4 rounded-xl bg-bg-card p-4 text-left transition-colors hover:bg-bg-hover disabled:opacity-50"
        @click="selectPlan(plan.id)"
      >
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" :class="planBgs[i % 3]">
          <component :is="planIcons[i % 3]" :size="24" :class="planColors[i % 3]" />
        </div>
        <div class="flex flex-1 flex-col gap-1">
          <span class="text-base font-semibold text-text-primary">{{ plan.name }}</span>
          <span v-if="plan.description" class="text-[13px] text-text-secondary">{{ plan.description }}</span>
        </div>
        <ChevronRight :size="20" class="shrink-0 text-text-secondary" />
      </button>
    </div>
  </div>
</template>
