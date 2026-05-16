<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Check } from 'lucide-vue-next'
import { useActiveWorkoutStore } from '@/entities/workout'
import { AppButton } from '@/shared/ui'
import { useToast } from '@/shared/lib/useToast'

const router = useRouter()
const activeStore = useActiveWorkoutStore()
const toast = useToast()

const notes = ref('')
const saving = ref(false)

// Capture workout data before it gets reset
const workoutTitle = ref('')
const workoutWeight = ref<number | null>(null)
const exerciseCount = ref(0)
const totalSets = ref(0)
const durationMins = ref(0)
const sessionId = ref<number | null>(null)

onMounted(() => {
  if (!activeStore.isActive && !activeStore.sessionId) {
    router.replace('/workouts')
    return
  }
  workoutTitle.value = activeStore.exercises[0]?.exercise_name ?? 'Тренировка'
  // Try to get the title from mode
  if (activeStore.mode === 'plan') {
    // Plan title is set as workout title on creation
    workoutTitle.value = 'Тренировка'
  }
  workoutWeight.value = activeStore.weightBefore
  exerciseCount.value = activeStore.exercises.length
  totalSets.value = activeStore.exercises.reduce((sum, ex) => sum + ex.completedSets.length, 0)
  durationMins.value = activeStore.startedAt
    ? Math.round((Date.now() - activeStore.startedAt) / 60000)
    : 0
  sessionId.value = activeStore.sessionId
})

const durationDisplay = computed(() => {
  if (durationMins.value > 0) return `${durationMins.value} мин`
  return '—'
})

const subtitle = computed(() => {
  const parts: string[] = []
  if (workoutTitle.value) parts.push(workoutTitle.value)
  if (durationMins.value > 0) parts.push(`${durationMins.value} мин`)
  return parts.join(' · ')
})

async function handleSave() {
  saving.value = true
  try {
    await activeStore.completeWorkout()
    toast.success('Тренировка сохранена!')
    router.push('/workouts')
  } catch {
    toast.error('Ошибка сохранения')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-bg">
    <!-- Header -->
    <div class="flex items-center gap-3 bg-bg-card px-4 pb-3 pt-4">
      <button class="text-text-primary" @click="router.back()">
        <ArrowLeft :size="22" />
      </button>
      <span class="text-lg font-bold text-text-primary">Завершение тренировки</span>
    </div>

    <!-- Content -->
    <div class="flex flex-1 flex-col gap-6 px-4 py-6">
      <!-- Success block -->
      <div class="flex flex-col items-center gap-3">
        <div class="flex h-16 w-16 items-center justify-center rounded-full bg-accent/[0.13]">
          <Check :size="32" class="text-accent" />
        </div>
        <h2 class="text-[22px] font-bold text-text-primary">Тренировка завершена!</h2>
        <p class="text-[15px] text-text-secondary">{{ subtitle }}</p>
      </div>

      <!-- Metrics -->
      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1 rounded-lg bg-bg-card p-3">
          <span class="text-[11px] text-text-secondary">Длительность</span>
          <span class="text-lg font-bold text-text-primary">{{ durationDisplay }}</span>
        </div>
        <div class="flex flex-col gap-1 rounded-lg bg-bg-card p-3">
          <span class="text-[11px] text-text-secondary">Вес до</span>
          <span class="text-lg font-bold text-text-primary">{{ workoutWeight ? `${workoutWeight} кг` : '—' }}</span>
        </div>
        <div class="flex flex-col gap-1 rounded-lg bg-bg-card p-3">
          <span class="text-[11px] text-text-secondary">Упражнений</span>
          <span class="text-lg font-bold text-text-primary">{{ exerciseCount }}</span>
        </div>
        <div class="flex flex-col gap-1 rounded-lg bg-bg-card p-3">
          <span class="text-[11px] text-text-secondary">Подходов</span>
          <span class="text-lg font-bold text-text-primary">{{ totalSets }}</span>
        </div>
      </div>

      <!-- Notes -->
      <div class="flex flex-col gap-2">
        <span class="text-[13px] font-medium text-text-secondary">Заметки о тренировке</span>
        <textarea
          v-model="notes"
          rows="4"
          placeholder="Как прошла тренировка? Что получилось хорошо, что можно улучшить..."
          class="resize-none rounded-lg border border-border bg-bg-input p-3 text-sm leading-relaxed text-text-primary outline-none placeholder:text-text-secondary/60 focus:border-accent"
        />
        <span class="text-xs text-text-secondary/70">Необязательное поле</span>
      </div>

      <!-- Spacer -->
      <div class="flex-1" />

      <!-- Save button -->
      <AppButton class="w-full" :loading="saving" @click="handleSave">
        Сохранить тренировку
      </AppButton>
    </div>
  </div>
</template>
