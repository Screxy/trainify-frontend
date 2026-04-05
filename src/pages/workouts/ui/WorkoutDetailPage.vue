<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Trash2, Clock, Dumbbell, Weight, Flame } from 'lucide-vue-next'
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
      map.set(s.exercise_id, { name: `Упражнение #${s.exercise_id}`, sets: [] })
    }
    map.get(s.exercise_id)!.sets.push(s)
  }
  return Array.from(map.values())
})

function formatDate(date?: string) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

async function handleDelete() {
  toast.info('Удаление тренировок пока недоступно')
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
    <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
      <div class="flex flex-col gap-1 rounded-lg border border-border bg-bg-card p-4">
        <Clock :size="16" class="text-text-secondary" />
        <span class="text-lg font-bold text-text-primary">{{ workout?.duration ?? '—' }} мин</span>
        <span class="text-xs text-text-secondary">Длительность</span>
      </div>
      <div class="flex flex-col gap-1 rounded-lg border border-border bg-bg-card p-4">
        <Dumbbell :size="16" class="text-text-secondary" />
        <span class="text-lg font-bold text-text-primary">{{ exerciseGroups.length }}</span>
        <span class="text-xs text-text-secondary">Упражнений</span>
      </div>
      <div class="flex flex-col gap-1 rounded-lg border border-border bg-bg-card p-4">
        <Flame :size="16" class="text-text-secondary" />
        <span class="text-lg font-bold text-text-primary">{{ workout?.sets?.length ?? 0 }}</span>
        <span class="text-xs text-text-secondary">Подходов</span>
      </div>
      <div class="flex flex-col gap-1 rounded-lg border border-border bg-bg-card p-4">
        <Weight :size="16" class="text-text-secondary" />
        <span class="text-lg font-bold text-text-primary">{{ workout?.weight_before ?? '—' }} кг</span>
        <span class="text-xs text-text-secondary">Вес до</span>
      </div>
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
