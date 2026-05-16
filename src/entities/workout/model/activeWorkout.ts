import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { workoutApi } from '../api'
import type { WorkoutPlanDetail } from '@/shared/types'

export interface ActiveExerciseSet {
  set_order: number
  weight: number
  reps: number
  is_warmup: boolean
}

export interface ActiveExercise {
  exercise_id: number
  exercise_name: string
  target_sets?: number
  target_reps?: number
  target_weight?: number
  exercise_order: number
  completedSets: ActiveExerciseSet[]
}

interface PersistedState {
  sessionId: number | null
  mode: 'plan' | 'free'
  exercises: ActiveExercise[]
  currentExerciseIndex: number
  startedAt: number
  weightBefore: number | null
}

const STORAGE_KEY = 'trainify_active_workout'

function loadFromStorage(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveToStorage(state: PersistedState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY)
}

export const useActiveWorkoutStore = defineStore('activeWorkout', () => {
  const sessionId = ref<number | null>(null)
  const mode = ref<'plan' | 'free'>('free')
  const exercises = ref<ActiveExercise[]>([])
  const currentExerciseIndex = ref(0)
  const startedAt = ref(0)
  const isActive = ref(false)
  const weightBefore = ref<number | null>(null)

  // Restore from localStorage on init
  const saved = loadFromStorage()
  if (saved && saved.sessionId) {
    sessionId.value = saved.sessionId
    mode.value = saved.mode
    exercises.value = saved.exercises
    currentExerciseIndex.value = saved.currentExerciseIndex
    startedAt.value = saved.startedAt
    weightBefore.value = saved.weightBefore ?? null
    isActive.value = true
  }

  // Persist on changes
  watch(
    [sessionId, mode, exercises, currentExerciseIndex, startedAt],
    () => {
      if (isActive.value) {
        saveToStorage({
          sessionId: sessionId.value,
          mode: mode.value,
          exercises: exercises.value,
          currentExerciseIndex: currentExerciseIndex.value,
          startedAt: startedAt.value,
          weightBefore: weightBefore.value,
        })
      }
    },
    { deep: true },
  )

  async function startFromPlan(plan: WorkoutPlanDetail, weight?: number, notes?: string) {
    const { data } = await workoutApi.create({
      date: new Date().toISOString().slice(0, 10),
      title: plan.name,
      notes: notes || undefined,
      weight_before: weight || undefined,
    })
    weightBefore.value = weight ?? null
    sessionId.value = data.id
    mode.value = 'plan'
    exercises.value = plan.exercises.map((e) => ({
      exercise_id: e.exercise_id,
      exercise_name: e.exercise_name ?? `Упражнение #${e.exercise_id}`,
      target_sets: e.target_sets,
      target_reps: e.target_reps,
      target_weight: e.target_weight,
      exercise_order: e.exercise_order,
      completedSets: [],
    }))
    currentExerciseIndex.value = 0
    startedAt.value = Date.now()
    isActive.value = true
  }

  async function startFreeMode(selected: ActiveExercise[], weight?: number, title?: string, notes?: string) {
    const { data } = await workoutApi.create({
      date: new Date().toISOString().slice(0, 10),
      title: title || 'Свободная тренировка',
      notes: notes || undefined,
      weight_before: weight || undefined,
    })
    weightBefore.value = weight ?? null
    sessionId.value = data.id
    mode.value = 'free'
    exercises.value = selected.map((e, i) => ({
      ...e,
      exercise_order: i + 1,
      completedSets: [],
    }))
    currentExerciseIndex.value = 0
    startedAt.value = Date.now()
    isActive.value = true
  }

  async function logSet(weight: number, reps: number, isWarmup = false) {
    if (!sessionId.value) return
    const ex = exercises.value[currentExerciseIndex.value]
    if (!ex) return

    const setOrder = ex.completedSets.length + 1
    const set: ActiveExerciseSet = { set_order: setOrder, weight, reps, is_warmup: isWarmup }

    // Save to API
    await workoutApi.addSets(sessionId.value, {
      sets: [{
        exercise_id: ex.exercise_id,
        weight,
        reps,
        is_warmup: isWarmup,
        exercise_order: ex.exercise_order,
        set_order: setOrder,
      }],
    })

    ex.completedSets.push(set)
  }

  function nextExercise() {
    if (currentExerciseIndex.value < exercises.value.length - 1) {
      currentExerciseIndex.value++
    }
  }

  function previousExercise() {
    if (currentExerciseIndex.value > 0) {
      currentExerciseIndex.value--
    }
  }

  function addExercise(exercise: ActiveExercise) {
    exercises.value.push({
      ...exercise,
      exercise_order: exercises.value.length + 1,
      completedSets: [],
    })
  }

  async function completeWorkout() {
    if (sessionId.value) {
      await workoutApi.complete(sessionId.value)
    }
    reset()
  }

  function abandon() {
    reset()
  }

  function reset() {
    sessionId.value = null
    mode.value = 'free'
    exercises.value = []
    currentExerciseIndex.value = 0
    startedAt.value = 0
    isActive.value = false
    weightBefore.value = null
    clearStorage()
  }

  return {
    sessionId,
    mode,
    exercises,
    currentExerciseIndex,
    startedAt,
    isActive,
    weightBefore,
    startFromPlan,
    startFreeMode,
    logSet,
    nextExercise,
    previousExercise,
    addExercise,
    completeWorkout,
    abandon,
  }
})
