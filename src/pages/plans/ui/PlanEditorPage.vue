<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-vue-next'
import { usePlanStore } from '@/entities/plan'
import { AppInput, AppButton } from '@/shared/ui'
import { useToast } from '@/shared/lib/useToast'
import type { PlanExercise } from '@/shared/types'

const route = useRoute()
const router = useRouter()
const planStore = usePlanStore()
const toast = useToast()

const isEdit = computed(() => !!route.params.id)
const planId = computed(() => Number(route.params.id))

const name = ref('')
const description = ref('')
const exercises = ref<PlanExercise[]>([])
const saving = ref(false)

onMounted(async () => {
  if (isEdit.value) {
    await planStore.fetchPlan(planId.value)
    if (planStore.currentPlan) {
      name.value = planStore.currentPlan.name
      description.value = planStore.currentPlan.description ?? ''
      exercises.value = [...planStore.currentPlan.exercises]
    }
  }
})

function addExercise() {
  exercises.value.push({
    exercise_id: 0,
    exercise_order: exercises.value.length + 1,
    target_sets: 3,
    target_reps: 10,
  })
}

function removeExercise(idx: number) {
  exercises.value.splice(idx, 1)
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
        description: description.value || undefined,
        exercises: exercises.value,
      })
      toast.success('План обновлён')
    } else {
      await planStore.createPlan({
        name: name.value,
        description: description.value || undefined,
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
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button class="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary hover:bg-bg-hover" @click="router.back()">
          <ArrowLeft :size="18" />
        </button>
        <h1 class="text-lg font-bold text-text-primary md:text-2xl">
          {{ isEdit ? 'Редактирование плана' : 'Новый план' }}
        </h1>
      </div>
      <AppButton size="m" :loading="saving" @click="save">Сохранить</AppButton>
    </div>

    <!-- Form -->
    <div class="flex flex-col gap-4">
      <AppInput v-model="name" label="Название плана" placeholder="Например: Push Day" />
      <AppInput v-model="description" label="Описание" placeholder="Краткое описание плана" />
    </div>

    <!-- Exercises -->
    <div class="flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <span class="text-sm font-semibold text-text-primary">Упражнения ({{ exercises.length }})</span>
        <AppButton size="s" variant="secondary" @click="addExercise">
          <Plus :size="14" />
          Добавить
        </AppButton>
      </div>

      <div v-if="exercises.length === 0" class="py-6 text-center text-sm text-text-secondary">
        Добавьте упражнения в план
      </div>

      <div
        v-for="(ex, i) in exercises"
        :key="i"
        class="flex items-start gap-3 rounded-lg border border-border bg-bg-card p-4"
      >
        <GripVertical :size="16" class="mt-2 shrink-0 text-text-secondary" />
        <div class="flex flex-1 flex-col gap-3">
          <AppInput :model-value="String(ex.exercise_id || '')" label="ID упражнения" type="number" placeholder="1" @update:model-value="ex.exercise_id = Number($event)" />
          <div class="grid grid-cols-3 gap-3">
            <AppInput :model-value="String(ex.target_sets ?? '')" label="Подходы" type="number" placeholder="3" @update:model-value="ex.target_sets = Number($event)" />
            <AppInput :model-value="String(ex.target_reps ?? '')" label="Повторения" type="number" placeholder="10" @update:model-value="ex.target_reps = Number($event)" />
            <AppInput :model-value="String(ex.target_weight ?? '')" label="Вес (кг)" type="number" placeholder="60" @update:model-value="ex.target_weight = Number($event)" />
          </div>
        </div>
        <button class="mt-2 shrink-0 text-text-secondary hover:text-error" @click="removeExercise(i)">
          <Trash2 :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>
