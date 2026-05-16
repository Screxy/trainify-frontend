<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { X, Pause, Play, Timer, Target, CircleCheck, Plus, Minus } from 'lucide-vue-next'
import { useActiveWorkoutStore } from '@/entities/workout'
import { AppButton, AppModal, ConfirmDialog } from '@/shared/ui'
import { useToast } from '@/shared/lib/useToast'
import AddExerciseModal from './AddExerciseModal.vue'

const router = useRouter()
const store = useActiveWorkoutStore()
const toast = useToast()

// Guard: redirect if no active workout
onMounted(() => {
  if (!store.isActive) {
    router.replace('/workouts')
  }
})

// Timer
const elapsed = ref(store.startedAt ? Math.floor((Date.now() - store.startedAt) / 1000) : 0)
let timerInterval: ReturnType<typeof setInterval> | undefined
const paused = ref(false)

function startTimer() {
  timerInterval = setInterval(() => {
    if (!paused.value) elapsed.value++
  }, 1000)
}
onMounted(startTimer)
onUnmounted(() => clearInterval(timerInterval))

function togglePause() {
  paused.value = !paused.value
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0')
  const s = (sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

// Current exercise
const currentExercise = computed(() => store.exercises[store.currentExerciseIndex])
const exerciseName = computed(() => currentExercise.value?.exercise_name ?? '')
const targetInfo = computed(() => {
  const ex = currentExercise.value
  if (!ex) return ''
  if (store.mode === 'free') {
    const count = ex.completedSets.length
    return `${count} ${count === 1 ? 'подход выполнен' : 'подхода выполнено'}`
  }
  const parts: string[] = []
  if (ex.target_sets) parts.push(`${ex.target_sets}`)
  if (ex.target_reps) parts.push(`×${ex.target_reps}`)
  if (ex.target_weight) parts.push(`@ ${ex.target_weight} кг`)
  return parts.join('') || 'Свободный режим'
})
const completedSets = computed(() => currentExercise.value?.completedSets ?? [])
const currentSetNumber = computed(() => completedSets.value.length + 1)
const progress = computed(() =>
  store.exercises.length > 0 ? (store.currentExerciseIndex + 1) / store.exercises.length : 0,
)
const isLastExercise = computed(() => store.currentExerciseIndex === store.exercises.length - 1)

// Set input — pre-fill from last set or target
const weight = ref(0)
const reps = ref(0)

watch(
  () => store.currentExerciseIndex,
  () => {
    const ex = currentExercise.value
    if (!ex) return
    const lastSet = ex.completedSets[ex.completedSets.length - 1]
    weight.value = lastSet?.weight ?? ex.target_weight ?? 0
    reps.value = lastSet?.reps ?? ex.target_reps ?? 0
  },
  { immediate: true },
)

function adjustWeight(delta: number) {
  weight.value = Math.max(0, weight.value + delta)
}
function adjustReps(delta: number) {
  reps.value = Math.max(0, reps.value + delta)
}

// Rest timer
const resting = ref(false)
const restTime = ref(90)
let restInterval: ReturnType<typeof setInterval> | undefined

function startRest() {
  resting.value = true
  restTime.value = 90
  restInterval = setInterval(() => {
    restTime.value--
    if (restTime.value <= 0) skipRest()
  }, 1000)
}

function skipRest() {
  resting.value = false
  clearInterval(restInterval)
}

// Logging
const logging = ref(false)
async function logSet() {
  if (!weight.value || !reps.value) return
  logging.value = true
  try {
    await store.logSet(weight.value, reps.value, false)
    startRest()
  } catch {
    toast.error('Не удалось сохранить подход')
  } finally {
    logging.value = false
  }
}

// Navigation
function handleNext() {
  if (isLastExercise.value) {
    showCompleteDialog.value = true
  } else {
    store.nextExercise()
  }
}

// Dialogs
const showCloseDialog = ref(false)
const showCompleteDialog = ref(false)
const showAddExercise = ref(false)

function handleComplete() {
  router.push('/workouts/finish')
}

function handleAbandon() {
  store.abandon()
  router.push('/workouts')
}

function formatRest(sec: number) {
  const m = Math.floor(sec / 60)
  const s = (sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-bg">
    <!-- Header -->
    <div class="flex flex-col gap-2 bg-bg-card px-4 pb-3 pt-4">
      <div class="flex items-center">
        <button class="text-text-secondary" @click="showCloseDialog = true">
          <X :size="22" />
        </button>
        <div class="flex flex-1 items-center justify-center gap-1.5">
          <Timer :size="18" class="text-accent" />
          <span class="text-2xl font-bold tabular-nums text-text-primary">{{ formatTime(elapsed) }}</span>
        </div>
        <button class="text-text-secondary" @click="togglePause">
          <Pause v-if="!paused" :size="22" />
          <Play v-else :size="22" />
        </button>
      </div>
      <!-- Progress (plan mode only) -->
      <div v-if="store.mode === 'plan'" class="flex flex-col gap-1.5">
        <span class="text-center text-xs text-text-secondary">
          Упражнение {{ store.currentExerciseIndex + 1 }} из {{ store.exercises.length }}
        </span>
        <div class="h-1 rounded-full bg-bg-input">
          <div
            class="h-full rounded-full bg-accent transition-all"
            :style="{ width: `${progress * 100}%` }"
          />
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-if="currentExercise" class="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-5">
      <!-- Exercise name + target -->
      <div class="flex flex-col items-center gap-1.5">
        <h2 class="text-center text-[22px] font-bold leading-tight text-text-primary">{{ exerciseName }}</h2>
        <div class="flex items-center gap-1.5">
          <Target v-if="store.mode === 'plan'" :size="16" class="text-text-secondary" />
          <CircleCheck v-else :size="16" class="text-text-secondary" />
          <span class="text-[15px] text-text-secondary">{{ targetInfo }}</span>
        </div>
      </div>

      <!-- Completed sets -->
      <div v-if="completedSets.length > 0" class="flex flex-col gap-2">
        <span class="text-sm font-semibold text-text-primary">Выполненные подходы</span>
        <div
          v-for="s in completedSets"
          :key="s.set_order"
          class="flex h-11 items-center gap-3 rounded-lg bg-bg-card px-4"
        >
          <span class="text-sm font-semibold text-text-secondary">{{ s.set_order }}</span>
          <span class="flex-1 text-sm text-text-primary">{{ s.weight }} кг × {{ s.reps }}</span>
          <CircleCheck :size="20" class="text-accent" />
        </div>
      </div>

      <!-- Current set input -->
      <div class="flex flex-col gap-4 rounded-xl bg-bg-card p-4">
        <span class="text-sm font-semibold text-text-primary">Подход {{ currentSetNumber }}</span>
        <div class="flex gap-3">
          <!-- Weight stepper -->
          <div class="flex flex-1 flex-col gap-1.5">
            <span class="text-xs text-text-secondary">Вес (кг)</span>
            <div class="flex items-center gap-2">
              <button
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-bg-input text-text-secondary hover:bg-bg-hover"
                @click="adjustWeight(-5)"
              >
                <Minus :size="16" />
              </button>
              <input
                v-model.number="weight"
                type="number"
                class="h-10 w-full rounded-lg border border-border bg-bg-input px-3 text-center text-lg font-bold text-text-primary outline-none focus:border-accent [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-bg-input text-text-secondary hover:bg-bg-hover"
                @click="adjustWeight(5)"
              >
                <Plus :size="16" />
              </button>
            </div>
          </div>
          <!-- Reps stepper -->
          <div class="flex flex-1 flex-col gap-1.5">
            <span class="text-xs text-text-secondary">Повторения</span>
            <div class="flex items-center gap-2">
              <button
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-bg-input text-text-secondary hover:bg-bg-hover"
                @click="adjustReps(-1)"
              >
                <Minus :size="16" />
              </button>
              <input
                v-model.number="reps"
                type="number"
                class="h-10 w-full rounded-lg border border-border bg-bg-input px-3 text-center text-lg font-bold text-text-primary outline-none focus:border-accent [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-bg-input text-text-secondary hover:bg-bg-hover"
                @click="adjustReps(1)"
              >
                <Plus :size="16" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Record button -->
      <AppButton class="w-full" :loading="logging" @click="logSet">
        Записать подход
      </AppButton>

      <!-- Navigation: plan mode -->
      <button
        v-if="store.mode === 'plan'"
        class="flex h-10 w-full items-center justify-center rounded-lg border border-border text-sm font-medium text-text-primary hover:bg-bg-hover"
        @click="handleNext"
      >
        {{ isLastExercise ? 'Завершить тренировку' : 'Следующее упражнение →' }}
      </button>

      <!-- Navigation: free mode -->
      <template v-if="store.mode === 'free'">
        <button
          class="flex h-10 w-full items-center justify-center gap-1 rounded-lg border border-border text-sm font-medium text-text-primary hover:bg-bg-hover"
          @click="showAddExercise = true"
        >
          + Добавить упражнение
        </button>
        <AppButton variant="danger" class="w-full" @click="showCompleteDialog = true">
          Завершить тренировку
        </AppButton>
      </template>
    </div>

    <!-- Rest panel -->
    <div v-if="resting" class="flex flex-col items-center gap-3 border-t border-border bg-bg-card px-4 pb-6 pt-4">
      <span class="text-[13px] font-medium text-text-secondary">Отдых</span>
      <span class="text-4xl font-bold text-accent">{{ formatRest(restTime) }}</span>
      <button
        class="flex h-10 items-center justify-center px-5 text-sm font-medium text-text-secondary hover:text-text-primary"
        @click="skipRest"
      >
        Пропустить
      </button>
    </div>

    <!-- Dialogs -->
    <AppModal v-model="showCloseDialog" title="Завершить тренировку?">
      <div class="flex flex-col gap-4">
        <p class="text-sm text-text-secondary">Вы можете сохранить тренировку или отменить её.</p>
        <div class="flex flex-col gap-2">
          <AppButton class="w-full" @click="handleComplete">Сохранить и завершить</AppButton>
          <AppButton variant="danger" class="w-full" @click="handleAbandon">Отменить тренировку</AppButton>
        </div>
      </div>
    </AppModal>

    <ConfirmDialog
      v-model="showCompleteDialog"
      title="Завершить тренировку?"
      message="Все упражнения выполнены. Сохранить результаты?"
      confirm-text="Завершить"
      @confirm="handleComplete"
    />

    <AddExerciseModal v-model="showAddExercise" />
  </div>
</template>
