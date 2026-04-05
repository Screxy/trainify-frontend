<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { X, Pause, Play, SkipForward } from 'lucide-vue-next'
import { AppButton, AppInput } from '@/shared/ui'

const router = useRouter()

// Timer
const elapsed = ref(0)
let timerInterval: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  timerInterval = setInterval(() => elapsed.value++, 1000)
})
onUnmounted(() => clearInterval(timerInterval))

const paused = ref(false)
function togglePause() {
  paused.value = !paused.value
  if (paused.value) {
    clearInterval(timerInterval)
  } else {
    timerInterval = setInterval(() => elapsed.value++, 1000)
  }
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0')
  const s = (sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

// Exercise state
const currentExercise = ref(3)
const totalExercises = ref(7)
const exerciseName = ref('Жим штанги лёжа')
const targetInfo = ref('4×10 @ 80 кг')

// Sets
const completedSets = ref([
  { set: 1, weight: 80, reps: 10 },
  { set: 2, weight: 80, reps: 10 },
])
const currentSet = ref(3)
const weight = ref('80')
const reps = ref('10')

// Rest
const resting = ref(false)
const restTime = ref(75)
let restInterval: ReturnType<typeof setInterval> | undefined

function logSet() {
  completedSets.value.push({
    set: currentSet.value,
    weight: Number(weight.value),
    reps: Number(reps.value),
  })
  currentSet.value++
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

function formatRest(sec: number) {
  const m = Math.floor(sec / 60)
  const s = (sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-bg">
    <!-- Header -->
    <div class="border-b border-border bg-bg-card px-4 pb-3 pt-4">
      <div class="flex items-center justify-between">
        <button class="text-text-secondary" @click="router.back()">
          <X :size="24" />
        </button>
        <span class="text-2xl font-bold tabular-nums text-text-primary">{{ formatTime(elapsed) }}</span>
        <button class="text-text-secondary" @click="togglePause">
          <Pause v-if="!paused" :size="24" />
          <Play v-else :size="24" />
        </button>
      </div>
      <div class="mt-3 flex flex-col gap-1">
        <span class="text-xs text-text-secondary">Упражнение {{ currentExercise }} из {{ totalExercises }}</span>
        <div class="h-1 rounded-full bg-bg-input">
          <div
            class="h-full rounded-full bg-accent transition-all"
            :style="{ width: `${(currentExercise / totalExercises) * 100}%` }"
          />
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-1 flex-col gap-5 p-4">
      <div class="text-center">
        <h2 class="text-[22px] font-bold text-text-primary">{{ exerciseName }}</h2>
        <p class="mt-1 text-sm text-text-secondary">{{ targetInfo }}</p>
      </div>

      <!-- Completed sets -->
      <div class="flex flex-col gap-2">
        <span class="text-xs font-medium text-text-secondary">Выполненные подходы</span>
        <div
          v-for="s in completedSets"
          :key="s.set"
          class="flex items-center justify-between rounded-lg border border-border bg-bg-card px-4 py-2.5"
        >
          <span class="text-sm text-text-secondary">Подход {{ s.set }}</span>
          <span class="text-sm font-medium text-text-primary">{{ s.weight }} кг × {{ s.reps }}</span>
        </div>
      </div>

      <!-- Current set input -->
      <div class="flex flex-col gap-3 rounded-lg border border-border bg-bg-card p-4">
        <span class="text-sm font-medium text-text-primary">Подход {{ currentSet }}</span>
        <div class="grid grid-cols-2 gap-3">
          <AppInput v-model="weight" label="Вес (кг)" type="number" placeholder="80" />
          <AppInput v-model="reps" label="Повторения" type="number" placeholder="10" />
        </div>
        <AppButton class="w-full" @click="logSet">Записать подход</AppButton>
      </div>

      <AppButton variant="secondary" class="w-full" @click="router.push('/workouts')">
        <SkipForward :size="16" />
        Следующее упражнение →
      </AppButton>
    </div>

    <!-- Rest overlay -->
    <Transition name="modal">
      <div v-if="resting" class="fixed inset-x-0 bottom-0 border-t border-border bg-bg-card p-6 text-center">
        <span class="text-sm text-text-secondary">Отдых</span>
        <div class="mt-1 text-4xl font-bold text-accent">{{ formatRest(restTime) }}</div>
        <button class="mt-3 text-sm text-text-secondary hover:text-text-primary" @click="skipRest">
          Пропустить
        </button>
      </div>
    </Transition>
  </div>
</template>
