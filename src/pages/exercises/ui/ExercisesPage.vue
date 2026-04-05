<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Plus } from 'lucide-vue-next'
import { useExerciseStore } from '@/entities/exercise'
import { AppButton, AppSelect, SearchInput, EmptyState } from '@/shared/ui'
import ExerciseCard from './ExerciseCard.vue'
import CreateExerciseModal from './CreateExerciseModal.vue'

const exerciseStore = useExerciseStore()
const search = ref('')
const typeFilter = ref('')
const showCreate = ref(false)

const typeOptions = [
  { value: '', label: 'Все типы' },
  { value: 'weights', label: 'Свободные веса' },
  { value: 'bodyweight', label: 'Своё тело' },
  { value: 'machine', label: 'Тренажёр' },
  { value: 'cardio', label: 'Кардио' },
]

onMounted(() => {
  exerciseStore.fetchExercises()
})

const filtered = computed(() => {
  let list = exerciseStore.exercises
  if (typeFilter.value) list = list.filter((e) => e.type === typeFilter.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter((e) => e.name.toLowerCase().includes(q))
  }
  return list
})
</script>

<template>
  <div class="flex flex-col gap-6 p-4 md:p-8">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold text-text-primary md:text-[32px]">Библиотека упражнений</h1>
      <AppButton size="m" @click="showCreate = true">
        <Plus :size="16" />
        Добавить
      </AppButton>
    </div>

    <div class="flex flex-col gap-3 md:flex-row">
      <div class="flex-1">
        <SearchInput v-model="search" placeholder="Поиск упражнений..." />
      </div>
      <div class="w-full md:w-48">
        <AppSelect v-model="typeFilter" :options="typeOptions" placeholder="Тип" />
      </div>
    </div>

    <div v-if="exerciseStore.loading" class="py-12 text-center text-text-secondary">Загрузка...</div>
    <EmptyState
      v-else-if="filtered.length === 0"
      title="Упражнений не найдено"
      description="Добавьте новое упражнение в библиотеку"
      action-text="Добавить"
      @action="showCreate = true"
    />
    <div v-else class="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <ExerciseCard v-for="ex in filtered" :key="ex.id" :exercise="ex" />
    </div>

    <CreateExerciseModal v-model="showCreate" />
  </div>
</template>
