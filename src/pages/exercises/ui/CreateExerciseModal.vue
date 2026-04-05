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
const muscleGroups = ref('')
const saving = ref(false)

const typeOptions = [
  { value: 'weights', label: 'Свободные веса' },
  { value: 'bodyweight', label: 'Своё тело' },
  { value: 'machine', label: 'Тренажёр' },
  { value: 'cardio', label: 'Кардио' },
]

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
      muscle_groups: muscleGroups.value ? muscleGroups.value.split(',').map((s) => s.trim()) : undefined,
    })
    toast.success('Упражнение добавлено')
    name.value = ''
    type.value = ''
    muscleGroups.value = ''
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
      <AppInput v-model="muscleGroups" label="Группы мышц" placeholder="грудь, трицепс" hint="Через запятую" />
      <AppButton type="submit" class="w-full" :loading="saving">Добавить</AppButton>
    </form>
  </AppModal>
</template>
