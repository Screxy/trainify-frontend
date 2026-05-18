<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Search, Plus, Check, Dumbbell } from 'lucide-vue-next'
import { useExerciseStore } from '@/entities/exercise'
import { useActiveWorkoutStore } from '@/entities/workout'
import type { ActiveExercise } from '@/entities/workout'
import { useToast } from '@/shared/lib/useToast'

const route = useRoute()
const router = useRouter()
const exerciseStore = useExerciseStore()
const activeWorkoutStore = useActiveWorkoutStore()
const toast = useToast()

const search = ref('')
const muscleFilter = ref('')
const selected = ref<ActiveExercise[]>([])
const starting = ref(false)

const muscleGroups = [
  { value: '', label: 'Все' },
  { value: 'Грудь', label: 'Грудь' },
  { value: 'Спина', label: 'Спина' },
  { value: 'Ноги', label: 'Ноги' },
  { value: 'Руки', label: 'Руки' },
]

const exerciseColors = ['text-accent', 'text-info', 'text-warning', 'text-error']
const exerciseBgs = ['bg-accent/[0.06]', 'bg-info/[0.06]', 'bg-warning/[0.06]', 'bg-error/[0.06]']

onMounted(() => {
  exerciseStore.fetchExercises()
})

const filteredExercises = computed(() => {
  let list = exerciseStore.exercises
  if (muscleFilter.value) {
    list = list.filter((e) =>
      e.muscle_groups.some((g) => g.toLowerCase().includes(muscleFilter.value.toLowerCase())),
    )
  }
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter((e) => e.name.toLowerCase().includes(q))
  }
  return list
})

const selectedIds = computed(() => new Set(selected.value.map((s) => s.exercise_id)))

function toggleExercise(id: number, name: string) {
  const idx = selected.value.findIndex((s) => s.exercise_id === id)
  if (idx !== -1) {
    selected.value.splice(idx, 1)
    selected.value.forEach((e, i) => (e.exercise_order = i + 1))
  } else {
    const exercise = exerciseStore.exercises.find((e) => e.id === id)
    selected.value.push({
      exercise_id: id,
      exercise_name: name,
      exercise_type: exercise?.type,
      exercise_order: selected.value.length + 1,
      completedSets: [],
    })
  }
}

function colorForIndex(i: number) {
  return exerciseColors[i % exerciseColors.length]
}
function bgForIndex(i: number) {
  return exerciseBgs[i % exerciseBgs.length]
}

async function startWorkout() {
  if (selected.value.length === 0) return
  starting.value = true
  try {
    const w = route.query.weight ? Number(route.query.weight) : undefined
    const t = route.query.title ? String(route.query.title) : undefined
    const n = route.query.notes ? String(route.query.notes) : undefined
    await activeWorkoutStore.startFreeMode(selected.value, w, t, n)
    router.push('/workouts/active')
  } catch {
    toast.error('Не удалось создать тренировку')
  } finally {
    starting.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-bg">
    <!-- Header -->
    <div class="flex h-[52px] items-center gap-3 px-5">
      <button class="text-text-primary" @click="router.back()">
        <ArrowLeft :size="24" />
      </button>
      <span class="text-lg font-semibold text-text-primary">Библиотека упражнений</span>
    </div>

    <!-- Search -->
    <div class="flex h-11 items-center gap-2.5 rounded-[10px] bg-bg-input mx-5 px-5">
      <Search :size="18" class="shrink-0 text-text-secondary" />
      <input
        v-model="search"
        type="text"
        placeholder="Поиск упражнений..."
        class="h-full w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary"
      />
    </div>

    <!-- Filter pills -->
    <div class="flex gap-2 overflow-x-auto px-5 py-3">
      <button
        v-for="mg in muscleGroups"
        :key="mg.value"
        class="shrink-0 rounded-2xl px-3.5 py-1.5 text-[13px] font-medium transition-colors"
        :class="muscleFilter === mg.value
          ? 'bg-accent text-bg font-semibold'
          : 'bg-bg-card text-text-secondary'"
        @click="muscleFilter = mg.value"
      >
        {{ mg.label }}
      </button>
    </div>

    <!-- Exercise list -->
    <div class="flex flex-1 flex-col gap-2 overflow-y-auto px-5 pb-4">
      <div v-if="exerciseStore.loading" class="py-12 text-center text-text-secondary">Загрузка...</div>
      <div v-else-if="filteredExercises.length === 0" class="py-12 text-center text-sm text-text-secondary">
        Ничего не найдено
      </div>
      <button
        v-for="(ex, i) in filteredExercises"
        :key="ex.id"
        class="flex items-center gap-3.5 rounded-xl bg-bg-card p-3.5 text-left transition-colors hover:bg-bg-hover"
        @click="toggleExercise(ex.id, ex.name)"
      >
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px]" :class="bgForIndex(i)">
          <Dumbbell :size="22" :class="colorForIndex(i)" />
        </div>
        <div class="flex flex-1 flex-col gap-0.5">
          <span class="text-[15px] font-semibold text-text-primary">{{ ex.name }}</span>
          <span class="text-xs text-text-secondary">{{ ex.muscle_groups.join(', ') }}</span>
        </div>
        <div
          v-if="selectedIds.has(ex.id)"
          class="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-accent bg-bg-input"
        >
          <Check :size="18" class="text-accent" />
        </div>
        <div v-else class="flex h-9 w-9 items-center justify-center rounded-full bg-accent">
          <Plus :size="18" class="text-bg" />
        </div>
      </button>
    </div>

    <!-- Bottom action bar -->
    <div
      v-if="selected.length > 0"
      class="flex items-center gap-3 border-t border-border bg-bg-card px-5 pb-8 pt-4"
    >
      <div class="flex flex-1 flex-col gap-0.5">
        <span class="text-sm font-semibold text-text-primary">
          {{ selected.length }} {{ selected.length === 1 ? 'упражнение выбрано' : 'упражнений выбрано' }}
        </span>
        <span class="truncate text-xs text-text-secondary">
          {{ selected.map((s) => s.exercise_name).join(', ') }}
        </span>
      </div>
      <button
        class="flex h-10 shrink-0 items-center justify-center rounded-lg bg-accent px-5 text-sm font-semibold text-bg"
        :disabled="starting"
        @click="startWorkout"
      >
        Добавить
      </button>
    </div>
  </div>
</template>
