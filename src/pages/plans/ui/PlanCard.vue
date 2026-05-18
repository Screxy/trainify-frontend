<script setup lang="ts">
import { computed, ref } from 'vue'
import { List, Trash2 } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useExerciseStore } from '@/entities/exercise'
import { useActiveWorkoutStore } from '@/entities/workout'
import { useToast } from '@/shared/lib'
import type { WorkoutPlan, WorkoutPlanDetail } from '@/shared/types'
import { AppButton } from '@/shared/ui'

interface Props {
  plan: WorkoutPlan
  detail?: WorkoutPlanDetail
}

const props = defineProps<Props>()
const emit = defineEmits<{ delete: [id: number] }>()

const router = useRouter()
const exerciseStore = useExerciseStore()
const activeWorkoutStore = useActiveWorkoutStore()
const toast = useToast()
const starting = ref(false)

function pluralize(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return forms[0]
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1]
  return forms[2]
}

const exerciseCount = computed(() => props.detail?.exercises.length ?? 0)
const exerciseCountLabel = computed(
  () =>
    `${exerciseCount.value} ${pluralize(exerciseCount.value, ['упражнение', 'упражнения', 'упражнений'])}`,
)

// Aggregate unique muscle groups from plan's exercises via exerciseStore lookup.
const muscleGroups = computed(() => {
  if (!props.detail) return []
  const exMap = new Map(exerciseStore.exercises.map((e) => [e.id, e.muscle_groups]))
  const seen = new Set<string>()
  for (const pe of props.detail.exercises) {
    const groups = exMap.get(pe.exercise_id) ?? []
    for (const g of groups) seen.add(g)
  }
  return Array.from(seen).slice(0, 4)
})

const groupColors = [
  { bg: 'bg-accent/20', text: 'text-accent' },
  { bg: 'bg-accent-secondary/20', text: 'text-accent-secondary' },
  { bg: 'bg-warning/20', text: 'text-warning' },
  { bg: 'bg-error/20', text: 'text-error' },
]

async function startWorkout() {
  if (activeWorkoutStore.isActive) {
    router.push('/workouts/active')
    return
  }
  if (!props.detail) {
    toast.error('Загрузка плана…')
    return
  }
  starting.value = true
  try {
    await activeWorkoutStore.startFromPlan(props.detail)
    router.push('/workouts/active')
  } catch {
    toast.error('Не удалось начать тренировку')
  } finally {
    starting.value = false
  }
}
</script>

<template>
  <div class="group relative flex flex-col gap-4 rounded-lg bg-bg-card p-6">
    <!-- Delete (hover-revealed on desktop, always on mobile) -->
    <button
      class="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md text-text-secondary opacity-0 transition-all hover:bg-bg-input hover:text-error group-hover:opacity-100 md:focus:opacity-100"
      title="Удалить план"
      @click="emit('delete', plan.id)"
    >
      <Trash2 :size="14" />
    </button>

    <div class="flex flex-col gap-2 pr-8">
      <h3 class="text-lg font-semibold text-text-primary">{{ plan.name }}</h3>
      <div class="flex items-center gap-2 text-sm text-text-secondary">
        <List :size="14" />
        <span>{{ exerciseCountLabel }}</span>
      </div>
    </div>

    <div v-if="muscleGroups.length > 0" class="flex flex-wrap gap-2">
      <span
        v-for="(g, i) in muscleGroups"
        :key="g"
        class="rounded px-2 py-0.5 text-[11px] font-semibold capitalize"
        :class="[groupColors[i % groupColors.length].bg, groupColors[i % groupColors.length].text]"
      >
        {{ g }}
      </span>
    </div>

    <div class="flex gap-3">
      <AppButton size="m" class="flex-1" :loading="starting" @click="startWorkout">Начать</AppButton>
      <AppButton
        size="m"
        variant="secondary"
        class="flex-1"
        @click="router.push(`/plans/${plan.id}/edit`)"
      >
        Редактировать
      </AppButton>
    </div>
  </div>
</template>
