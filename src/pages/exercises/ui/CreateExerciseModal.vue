<script setup lang="ts">
import { ref } from 'vue'
import { AppModal, AppInput, AppSelect, AppButton } from '@/shared/ui'
import { useExerciseStore } from '@/entities/exercise'
import { useToast } from '@/shared/lib/useToast'
import type { ExerciseType } from '@/shared/types'

interface Props {
  modelValue: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const exerciseStore = useExerciseStore()
const toast = useToast()

const name = ref('')
const type = ref<ExerciseType | ''>('')
const selectedMuscleGroups = ref<string[]>([])
const saving = ref(false)

const typeOptions = [
  { value: 'weights', label: 'Свободные веса' },
  { value: 'bodyweight', label: 'Своё тело' },
  { value: 'machine', label: 'Тренажёр' },
  { value: 'cardio', label: 'Кардио' },
]

const muscleGroupOptions: { value: string; label: string }[] = [
  { value: 'chest', label: 'Грудь' },
  { value: 'back', label: 'Спина' },
  { value: 'legs', label: 'Ноги' },
  { value: 'shoulders', label: 'Плечи' },
  { value: 'arms', label: 'Руки' },
  { value: 'core', label: 'Пресс' },
  { value: 'glutes', label: 'Ягодицы' },
]

function toggleMuscleGroup(value: string) {
  const idx = selectedMuscleGroups.value.indexOf(value)
  if (idx === -1) selectedMuscleGroups.value.push(value)
  else selectedMuscleGroups.value.splice(idx, 1)
}

async function save() {
  if (!name.value || !type.value) {
    toast.error('Заполните название и тип')
    return
  }
  saving.value = true
  try {
    await exerciseStore.createExercise({
      name: name.value,
      type: type.value as ExerciseType,
      muscle_groups: selectedMuscleGroups.value.length ? [...selectedMuscleGroups.value] : undefined,
    })
    toast.success('Упражнение добавлено')
    name.value = ''
    type.value = ''
    selectedMuscleGroups.value = []
    emit('update:modelValue', false)
  } catch {
    toast.error('Не удалось создать упражнение')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AppModal :model-value="modelValue" title="Новое упражнение" @update:model-value="$emit('update:modelValue', $event)">
    <form class="flex flex-col gap-4" @submit.prevent="save">
      <AppInput v-model="name" label="Название" placeholder="Жим лёжа" />
      <AppSelect v-model="type" label="Тип" :options="typeOptions" />
      <div class="flex flex-col gap-1.5">
        <label class="text-[13px] font-medium text-text-secondary">Группы мышц</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="opt in muscleGroupOptions"
            :key="opt.value"
            type="button"
            class="rounded-full border px-3 py-1 text-xs transition-colors"
            :class="
              selectedMuscleGroups.includes(opt.value)
                ? 'border-accent bg-accent/[0.12] text-accent'
                : 'border-border bg-bg-input text-text-secondary hover:border-accent/40 hover:text-text-primary'
            "
            @click="toggleMuscleGroup(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
      <AppButton type="submit" class="w-full" :loading="saving">Добавить</AppButton>
    </form>
  </AppModal>
</template>
