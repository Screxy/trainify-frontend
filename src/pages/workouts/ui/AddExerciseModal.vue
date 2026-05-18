<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Plus } from 'lucide-vue-next'
import { AppModal, SearchInput } from '@/shared/ui'
import { useExerciseStore } from '@/entities/exercise'
import { useActiveWorkoutStore } from '@/entities/workout'

interface Props {
  modelValue: boolean
}

defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>()

const exerciseStore = useExerciseStore()
const activeWorkoutStore = useActiveWorkoutStore()
const search = ref('')

onMounted(() => {
  if (exerciseStore.exercises.length === 0) {
    exerciseStore.fetchExercises()
  }
})

const filtered = computed(() => {
  const existingIds = new Set(activeWorkoutStore.exercises.map((e) => e.exercise_id))
  let list = exerciseStore.exercises.filter((e) => !existingIds.has(e.id))
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter((e) => e.name.toLowerCase().includes(q))
  }
  return list
})

function select(id: number, name: string) {
  const exercise = exerciseStore.exercises.find((e) => e.id === id)
  activeWorkoutStore.addExercise({
    exercise_id: id,
    exercise_name: name,
    exercise_type: exercise?.type,
    exercise_order: activeWorkoutStore.exercises.length + 1,
    completedSets: [],
  })
  emit('update:modelValue', false)
}
</script>

<template>
  <AppModal :model-value="modelValue" title="Добавить упражнение" @update:model-value="$emit('update:modelValue', $event)">
    <div class="flex flex-col gap-3">
      <SearchInput v-model="search" placeholder="Поиск..." />

      <div class="max-h-[300px] overflow-y-auto">
        <div v-if="filtered.length === 0" class="py-6 text-center text-sm text-text-secondary">
          Упражнений не найдено
        </div>
        <button
          v-for="ex in filtered"
          :key="ex.id"
          class="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-bg-hover"
          @click="select(ex.id, ex.name)"
        >
          <div class="flex flex-col gap-0.5">
            <span class="text-sm text-text-primary">{{ ex.name }}</span>
            <span class="text-xs text-text-secondary">{{ ex.muscle_groups.join(', ') }}</span>
          </div>
          <Plus :size="16" class="shrink-0 text-accent" />
        </button>
      </div>
    </div>
  </AppModal>
</template>
