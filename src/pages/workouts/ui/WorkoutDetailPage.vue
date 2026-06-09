<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Trash2 } from 'lucide-vue-next'
import { useWorkoutStore } from '@/entities/workout'
import { AppButton, AppBadge, ConfirmDialog } from '@/shared/ui'
import { useToast } from '@/shared/lib/useToast'
import { ref } from 'vue'
import ExerciseSetGroup from './ExerciseSetGroup.vue'

const route = useRoute()
const router = useRouter()
const workoutStore = useWorkoutStore()
const toast = useToast()
const showDeleteDialog = ref(false)

const id = Number(route.params.id)

onMounted(() => {
  workoutStore.fetchWorkout(id)
})

const workout = computed(() => workoutStore.currentWorkout)

const exerciseGroups = computed(() => {
  if (!workout.value?.sets) return []
  const map = new Map<number, { name: string; sets: typeof workout.value.sets }>()
  for (const s of workout.value.sets) {
    if (!map.has(s.exercise_id)) {
      map.set(s.exercise_id, { name: s.exercise_name || `Упражнение #${s.exercise_id}`, sets: [] })
    }
    map.get(s.exercise_id)!.sets.push(s)
  }
  return Array.from(map.values())
})

const duration = computed(() => {
  const w = workout.value
  if (w?.completed_at && w?.created_at) {
    const start = new Date(w.created_at).getTime()
    const end = new Date(w.completed_at).getTime()
    const mins = Math.round((end - start) / 60000)
    if (mins > 0) return `${mins} мин`
  }
  return '—'
})

const totalSets = computed(() => workout.value?.sets?.length ?? 0)

const weightBefore = computed(() =>
  workout.value?.weight_before ? `${workout.value.weight_before} кг` : '—',
)

function formatDate(date?: string) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

async function handleDelete() {
  try {
    await workoutStore.deleteWorkout(id)
    toast.success('Тренировка удалена')
    router.push('/workouts')
  } catch {
    toast.error('Не удалось удалить тренировку')
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 p-4 md:p-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button class="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-bg-hover" @click="router.back()">
          <ArrowLeft :size="18" />
        </button>
        <div>
          <h1 class="text-lg font-bold text-text-primary md:text-2xl">
            {{ workout?.title || 'Тренировка' }}
          </h1>
          <div class="flex items-center gap-2 text-xs text-text-secondary">
            <AppBadge v-if="workout?.completed_at" variant="success">Завершена</AppBadge>
            <AppBadge v-else variant="default">В процессе</AppBadge>
            <span>{{ formatDate(workout?.date) }}</span>
          </div>
        </div>
      </div>
      <AppButton variant="danger" size="m" @click="showDeleteDialog = true">
        <Trash2 :size="16" />
        <span class="hidden md:inline">Удалить</span>
      </AppButton>
    </div>

    <!-- Metrics -->
    <div class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      <div class="flex flex-col gap-1 rounded-lg bg-bg-card p-4">
        <span class="text-xs text-text-secondary">Длительность</span>
        <span class="text-xl font-bold text-text-primary">{{ duration }}</span>
      </div>
      <div class="flex flex-col gap-1 rounded-lg bg-bg-card p-4">
        <span class="text-xs text-text-secondary">Вес до тренировки</span>
        <span class="text-xl font-bold text-text-primary">{{ weightBefore }}</span>
      </div>
      <div class="flex flex-col gap-1 rounded-lg bg-bg-card p-4">
        <span class="text-xs text-text-secondary">Упражнений</span>
        <span class="text-xl font-bold text-text-primary">{{ exerciseGroups.length }}</span>
      </div>
      <div class="flex flex-col gap-1 rounded-lg bg-bg-card p-4">
        <span class="text-xs text-text-secondary">Подходов</span>
        <span class="text-xl font-bold text-text-primary">{{ totalSets }}</span>
      </div>
    </div>

    <!-- Notes -->
    <div v-if="workout?.notes" class="rounded-lg border border-border bg-bg-card px-5 py-4">
      <span class="text-xs font-medium text-text-secondary">Заметки</span>
      <p class="mt-1 text-sm text-text-primary">{{ workout.notes }}</p>
    </div>

    <!-- Exercise list -->
    <div v-if="workoutStore.loading" class="py-8 text-center text-text-secondary">Загрузка...</div>
    <div v-else class="flex flex-col gap-4">
      <ExerciseSetGroup
        v-for="(group, i) in exerciseGroups"
        :key="i"
        :exercise-name="group.name"
        :sets="group.sets"
      />
    </div>

    <!-- Delete on mobile -->
    <AppButton variant="danger" class="w-full md:hidden" @click="showDeleteDialog = true">
      <Trash2 :size="16" />
      Удалить тренировку
    </AppButton>

    <ConfirmDialog
      v-model="showDeleteDialog"
      title="Удалить тренировку?"
      message="Это действие нельзя отменить. Все данные тренировки будут удалены."
      confirm-text="Удалить"
      variant="danger"
      @confirm="handleDelete"
    />
  </div>
</template>
