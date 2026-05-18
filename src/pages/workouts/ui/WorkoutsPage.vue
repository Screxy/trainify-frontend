<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from 'lucide-vue-next'
import { useWorkoutStore } from '@/entities/workout'
import { AppButton, SearchInput, EmptyState } from '@/shared/ui'
import WorkoutItem from './WorkoutItem.vue'

const router = useRouter()
const workoutStore = useWorkoutStore()
const search = ref('')

onMounted(() => {
  workoutStore.fetchWorkouts()
})

const filtered = computed(() => {
  if (!search.value) return workoutStore.workouts
  const q = search.value.toLowerCase()
  return workoutStore.workouts.filter((w) =>
    (w.title ?? '').toLowerCase().includes(q),
  )
})

function startNew() {
  router.push('/workouts/new')
}
</script>

<template>
  <div class="flex flex-col gap-6 p-4 md:p-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold text-text-primary md:text-[32px]">Тренировки</h1>
      <div class="hidden md:block">
        <AppButton size="m" @click="startNew">
          <Plus :size="16" />
          Новая тренировка
        </AppButton>
      </div>
      <button class="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-bg md:hidden" @click="startNew">
        <Plus :size="18" />
      </button>
    </div>

    <!-- Search -->
    <SearchInput v-model="search" placeholder="Поиск тренировок..." />

    <!-- List -->
    <div v-if="workoutStore.loading" class="py-12 text-center text-text-secondary">Загрузка...</div>
    <EmptyState
      v-else-if="filtered.length === 0"
      title="Нет тренировок"
      description="Начните первую тренировку прямо сейчас"
      action-text="Начать"
      @action="startNew"
    />
    <div v-else class="flex flex-col gap-3">
      <WorkoutItem v-for="w in filtered" :key="w.id" :workout="w" />
    </div>
  </div>
</template>
