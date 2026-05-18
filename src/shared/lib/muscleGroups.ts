import type { MuscleGroupKey } from '@/shared/types'

export const muscleNames: Record<MuscleGroupKey, string> = {
  chest: 'Грудь',
  back: 'Спина',
  legs: 'Ноги',
  shoulders: 'Плечи',
  arms: 'Руки',
  core: 'Пресс',
  glutes: 'Ягодицы',
}

export function translateMuscleGroup(key?: string): string {
  if (!key) return ''
  return muscleNames[key as MuscleGroupKey] ?? key
}
