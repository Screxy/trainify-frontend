// User
export interface User {
  id: number
  email: string
  role: 'user' | 'admin'
  name?: string
  created_at?: string
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

// Dashboard
export type MuscleGroupKey =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'arms'
  | 'core'
  | 'glutes'

export interface MuscleBalance {
  group: MuscleGroupKey
  percent: number
}

export interface MainLift {
  exercise_id: number
  exercise_name: string
  delta_kg: number
}

export interface RecentWorkoutSummary {
  id: number
  date: string
  title?: string
  duration_min: number
  tonnage: number
  main_muscle_group?: MuscleGroupKey
}

export interface DashboardResponse {
  workouts_this_month: number
  streak_days: number
  main_lift?: MainLift
  prs_this_month: number
  muscle_balance: MuscleBalance[]
  recent_workouts: RecentWorkoutSummary[]
}

// AI Insights
export type AIGoal = 'strength' | 'hypertrophy' | 'endurance' | 'weight_loss' | 'general'
export type AIInsightStatus = 'pending' | 'running' | 'completed' | 'failed'
export type AIInsightSeverity = 'low' | 'medium' | 'high'

export interface AIInsightRecommendation {
  area: string
  advice: string
  severity: AIInsightSeverity
}

export interface AIInsightResult {
  summary: string
  recommendations: AIInsightRecommendation[]
}

export interface AIInsightJob {
  id: string
  status: AIInsightStatus
  created_at: string
  finished_at?: string
  result?: AIInsightResult
  error?: string
}

export interface AIInsightLatest {
  job?: AIInsightJob
  next_available_at: string
}

export interface CreateAIInsightRequest {
  goal?: AIGoal
  notes?: string
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
  is_warmup?: boolean
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
