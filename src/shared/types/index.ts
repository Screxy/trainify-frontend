// User
export interface User {
  id: number
  email: string
  role: 'user' | 'admin'
  name?: string
}

// Exercise
export type ExerciseType = 'weights' | 'bodyweight' | 'machine' | 'cardio'

export interface Exercise {
  id: number
  name: string
  type: ExerciseType
  muscle_groups: string[]
}

export interface CreateExerciseRequest {
  name: string
  type: ExerciseType
  muscle_groups?: string[]
}

// Workout
export interface WorkoutSession {
  id: number
  date: string
  title?: string
  notes?: string
  weight_before?: number
  completed_at?: string
  created_at?: string
}

export interface TrainingSet {
  exercise_id: number
  weight?: number
  reps: number
  is_warmup?: boolean
  exercise_order: number
  set_order: number
}

export interface TrainingSetResponse extends TrainingSet {
  id: number
  exercise_name?: string
}

export interface WorkoutSessionDetail extends WorkoutSession {
  sets: TrainingSetResponse[]
}

export interface CreateWorkoutRequest {
  date: string
  title?: string
  notes?: string
  weight_before?: number
}

export interface AddSetsRequest {
  sets: TrainingSet[]
}

// Analytics
export interface ProgressPoint {
  date: string
  max_weight: number
  volume: number
}

export interface PersonalRecord {
  exercise_id: number
  exercise_name: string
  max_weight: number
  max_reps: number
}

// Plans
export interface WorkoutPlan {
  id: number
  name: string
  description?: string
  created_at?: string
}

export interface PlanExercise {
  exercise_id: number
  exercise_name?: string
  target_sets?: number
  target_reps?: number
  target_weight?: number
  exercise_order: number
}

export interface WorkoutPlanDetail extends WorkoutPlan {
  exercises: PlanExercise[]
}

export interface CreatePlanRequest {
  name: string
  description?: string
  exercises?: PlanExercise[]
}

export interface UpdatePlanRequest {
  name?: string
  description?: string
  exercises?: PlanExercise[]
}
