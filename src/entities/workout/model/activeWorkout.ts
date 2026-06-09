import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { get as idbGet, set as idbSet, del as idbDel, createStore } from 'idb-keyval'
import { workoutApi } from '../api'
import { useExerciseStore } from '@/entities/exercise'
import type { ExerciseType, WorkoutPlanDetail } from '@/shared/types'

export interface ActiveExerciseSet {
  set_order: number
  weight?: number
  reps: number
  is_warmup: boolean
}

export interface ActiveExercise {
  exercise_id: number
  exercise_name: string
  exercise_type?: ExerciseType
  target_sets?: number
  target_reps?: number
  target_weight?: number
  is_warmup?: boolean
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

// Dedicated IndexedDB store so DevTools shows a clear DB name.
const idbStore = createStore('trainify-app', 'kv')

async function loadFromStorage(): Promise<PersistedState | null> {
  try {
    const fromIdb = await idbGet<PersistedState>(STORAGE_KEY, idbStore)
    if (fromIdb) return fromIdb
    // One-shot migration from legacy localStorage (early dev seeds).
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedState
    await idbSet(STORAGE_KEY, parsed, idbStore).catch(() => undefined)
    localStorage.removeItem(STORAGE_KEY)
    return parsed
  } catch {
    return null
  }
}

function saveToStorage(state: PersistedState) {
  // Fire-and-forget; failures are non-critical (session will resume on next change).
  void idbSet(STORAGE_KEY, state, idbStore).catch(() => undefined)
}

function clearStorage() {
  void idbDel(STORAGE_KEY, idbStore).catch(() => undefined)
}

export const useActiveWorkoutStore = defineStore('activeWorkout', () => {
  const sessionId = ref<number | null>(null)
  const mode = ref<'plan' | 'free'>('free')
  const exercises = ref<ActiveExercise[]>([])
  const currentExerciseIndex = ref(0)
  const startedAt = ref(0)
  const isActive = ref(false)
  const weightBefore = ref<number | null>(null)

  // Restore from IndexedDB on init (async — UI awaits via ensureRestored()).
  const ready = ref(false)
  const readyPromise = loadFromStorage().then((saved) => {
    if (saved && saved.sessionId) {
      sessionId.value = saved.sessionId
      mode.value = saved.mode
      exercises.value = saved.exercises
      currentExerciseIndex.value = saved.currentExerciseIndex
      startedAt.value = saved.startedAt
      weightBefore.value = saved.weightBefore ?? null
      isActive.value = true
    }
    ready.value = true
  })

  async function ensureRestored() {
    if (!ready.value) await readyPromise
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

  async function startFromPlan(
    plan: WorkoutPlanDetail,
    weight?: number,
    notes?: string,
    title?: string,
  ) {
    const { data } = await workoutApi.create({
      date: new Date().toISOString().slice(0, 10),
      title: title?.trim() || plan.name,
      notes: notes || undefined,
      weight_before: weight || undefined,
    })
    const exerciseStore = useExerciseStore()
    if (exerciseStore.exercises.length === 0) {
      await exerciseStore.fetchExercises()
    }
    const typeById = new Map(exerciseStore.exercises.map((e) => [e.id, e.type]))
    weightBefore.value = weight ?? null
    sessionId.value = data.id
    mode.value = 'plan'
    exercises.value = plan.exercises.map((e) => ({
      exercise_id: e.exercise_id,
      exercise_name: e.exercise_name ?? `Упражнение #${e.exercise_id}`,
      exercise_type: typeById.get(e.exercise_id),
      target_sets: e.target_sets,
      target_reps: e.target_reps,
      target_weight: e.target_weight,
      is_warmup: e.is_warmup,
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

  async function logSet(weight: number | undefined, reps: number, isWarmup = false) {
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
    ready,
    ensureRestored,
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
