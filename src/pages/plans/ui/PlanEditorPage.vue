<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, GripVertical, Search, Trash2 } from 'lucide-vue-next'
import draggable from 'vuedraggable'
import { usePlanStore } from '@/entities/plan'
import { useExerciseStore } from '@/entities/exercise'
import { AppButton } from '@/shared/ui'
import { useToast } from '@/shared/lib/useToast'
import type { PlanExercise } from '@/shared/types'

const route = useRoute()
const router = useRouter()
const planStore = usePlanStore()
const exerciseStore = useExerciseStore()
const toast = useToast()

const isEdit = computed(() => !!route.params.id)
const planId = computed(() => Number(route.params.id))

const name = ref('')
const exercises = ref<PlanExercise[]>([])
const saving = ref(false)
const searchQuery = ref('')
const showSearch = ref(false)

onMounted(async () => {
  exerciseStore.fetchExercises()
  if (isEdit.value) {
    await planStore.fetchPlan(planId.value)
    if (planStore.currentPlan) {
      name.value = planStore.currentPlan.name
      exercises.value = [...planStore.currentPlan.exercises]
    }
  }
})

const searchResults = computed(() => {
  if (!searchQuery.value) return exerciseStore.exercises.slice(0, 8)
  const q = searchQuery.value.toLowerCase()
  return exerciseStore.exercises.filter((e) => e.name.toLowerCase().includes(q)).slice(0, 8)
})

function addExercise(id: number, exerciseName: string) {
  if (exercises.value.some((e) => e.exercise_id === id)) {
    toast.info('Упражнение уже добавлено')
    return
  }
  exercises.value.push({
    exercise_id: id,
    exercise_name: exerciseName,
    exercise_order: exercises.value.length + 1,
    target_sets: 3,
    target_reps: 10,
  })
  searchQuery.value = ''
  showSearch.value = false
}

function removeExercise(idx: number) {
  exercises.value.splice(idx, 1)
  reorderAll()
}

function reorderAll() {
  exercises.value.forEach((e, i) => (e.exercise_order = i + 1))
}

async function save() {
  if (!name.value.trim()) {
    toast.error('Введите название плана')
    return
  }
  saving.value = true
  try {
    if (isEdit.value) {
      await planStore.updatePlan(planId.value, {
        name: name.value,
        exercises: exercises.value,
      })
      toast.success('План обновлён')
    } else {
      await planStore.createPlan({
        name: name.value,
        exercises: exercises.value,
      })
      toast.success('План создан')
    }
    router.push('/plans')
  } catch {
    toast.error('Не удалось сохранить план')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 p-4 md:p-8">
    <!-- Header: Desktop -->
    <div class="hidden items-center justify-between md:flex">
      <button class="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary" @click="router.push('/plans')">
        <ArrowLeft :size="18" />
        Назад к планам
      </button>
      <div class="flex items-center gap-3">
        <button class="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-bg-hover" @click="router.push('/plans')">
          Отменить
        </button>
        <AppButton size="m" :loading="saving" @click="save">Сохранить</AppButton>
      </div>
    </div>

    <!-- Header: Mobile -->
    <div class="flex items-center gap-3 md:hidden">
      <button class="text-text-primary" @click="router.back()">
        <ArrowLeft :size="24" />
      </button>
      <span class="text-xl font-bold text-text-primary">Редактор плана</span>
    </div>

    <!-- Name input -->
    <div class="flex flex-col gap-2">
      <label class="hidden text-sm font-medium text-text-primary md:block">Название плана</label>
      <input
        v-model="name"
        type="text"
        placeholder="Силовая база"
        class="h-12 rounded-md border border-border bg-bg-input px-4 text-base text-text-primary outline-none placeholder:text-text-secondary focus:border-accent"
      />
    </div>

    <!-- Add exercise search -->
    <div class="relative flex flex-col gap-2">
      <label class="hidden text-sm font-medium text-text-primary md:block">Добавить упражнение</label>
      <div class="flex h-11 items-center gap-2 rounded-md border border-border bg-bg-input px-4">
        <Search :size="18" class="shrink-0 text-text-secondary" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск упражнений..."
          class="h-full w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary"
          @focus="showSearch = true"
        />
      </div>
      <!-- Search dropdown -->
      <div
        v-if="showSearch && searchResults.length > 0"
        class="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-lg border border-border bg-bg-card shadow-lg"
      >
        <button
          v-for="ex in searchResults"
          :key="ex.id"
          class="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-bg-hover"
          @click="addExercise(ex.id, ex.name)"
        >
          <span class="text-sm font-medium text-text-primary">{{ ex.name }}</span>
          <span class="text-xs text-text-secondary">{{ ex.muscle_groups.join(', ') }}</span>
        </button>
      </div>
    </div>

    <!-- Click outside to close -->
    <div v-if="showSearch" class="fixed inset-0 z-10" @click="showSearch = false" />

    <!-- Exercise list -->
    <div class="flex flex-col gap-3">
      <span class="text-base font-semibold text-text-primary">Упражнения ({{ exercises.length }})</span>

      <div v-if="exercises.length === 0" class="py-6 text-center text-sm text-text-secondary">
        Добавьте упражнения через поиск выше
      </div>

      <draggable
        v-else
        v-model="exercises"
        item-key="exercise_id"
        handle=".drag-handle"
        animation="200"
        ghost-class="drag-ghost"
        chosen-class="drag-chosen"
        :force-fallback="true"
        :fallback-tolerance="3"
        class="flex flex-col gap-3"
        @end="reorderAll"
      >
        <template #item="{ element: ex, index: i }">
          <div class="flex items-start gap-3 rounded-lg bg-bg-card p-3 md:items-center md:p-4">
            <button
              type="button"
              class="drag-handle flex shrink-0 cursor-grab touch-none items-center self-stretch text-text-secondary hover:text-text-primary active:cursor-grabbing"
              aria-label="Перетащить"
            >
              <GripVertical :size="20" />
            </button>
            <div class="flex flex-1 flex-col gap-2 min-w-0">
              <span class="truncate text-sm font-semibold text-text-primary md:text-base">
                {{ ex.exercise_name || `Упражнение #${ex.exercise_id}` }}
              </span>
              <div class="flex gap-2 md:gap-4">
                <div class="flex flex-1 flex-col gap-1 md:flex-none">
                  <span class="text-xs text-text-secondary">Подходы</span>
                  <input
                    :value="ex.target_sets ?? ''"
                    type="number"
                    inputmode="numeric"
                    class="h-9 w-full rounded border border-border bg-bg-input text-center text-sm text-text-primary outline-none focus:border-accent md:w-20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    @input="ex.target_sets = Number(($event.target as HTMLInputElement).value) || undefined"
                  />
                </div>
                <div class="flex flex-1 flex-col gap-1 md:flex-none">
                  <span class="text-xs text-text-secondary">Повторы</span>
                  <input
                    :value="ex.target_reps ?? ''"
                    type="number"
                    inputmode="numeric"
                    class="h-9 w-full rounded border border-border bg-bg-input text-center text-sm text-text-primary outline-none focus:border-accent md:w-20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    @input="ex.target_reps = Number(($event.target as HTMLInputElement).value) || undefined"
                  />
                </div>
                <div class="flex flex-1 flex-col gap-1 md:flex-none">
                  <span class="text-xs text-text-secondary">Вес (кг)</span>
                  <input
                    :value="ex.target_weight ?? ''"
                    type="number"
                    inputmode="decimal"
                    class="h-9 w-full rounded border border-border bg-bg-input text-center text-sm text-text-primary outline-none focus:border-accent md:w-20 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    @input="ex.target_weight = Number(($event.target as HTMLInputElement).value) || undefined"
                  />
                </div>
              </div>
            </div>
            <button
              type="button"
              class="shrink-0 self-start p-1 text-error hover:text-error/80 md:self-center"
              aria-label="Удалить упражнение"
              @click="removeExercise(i)"
            >
              <Trash2 :size="18" />
            </button>
          </div>
        </template>
      </draggable>
    </div>

    <!-- Mobile bottom buttons -->
    <div class="flex gap-3 md:hidden">
      <button
        class="flex h-11 flex-1 items-center justify-center rounded-md border border-border text-sm font-medium text-text-primary hover:bg-bg-hover"
        @click="router.push('/plans')"
      >
        Отмена
      </button>
      <AppButton class="flex-1" :loading="saving" @click="save">
        Сохранить
      </AppButton>
    </div>
  </div>
</template>

<style scoped>
.drag-ghost {
  opacity: 0.4;
}
.drag-chosen {
  box-shadow: 0 0 0 2px var(--color-accent);
}
</style>
