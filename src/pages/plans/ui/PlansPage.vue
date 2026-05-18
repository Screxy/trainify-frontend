<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from 'lucide-vue-next'
import { usePlanStore } from '@/entities/plan'
import { useExerciseStore } from '@/entities/exercise'
import { AppButton, EmptyState, ConfirmDialog } from '@/shared/ui'
import { useToast } from '@/shared/lib/useToast'
import PlanCard from './PlanCard.vue'

const router = useRouter()
const planStore = usePlanStore()
const exerciseStore = useExerciseStore()
const toast = useToast()

const deleteId = ref<number | null>(null)
const showDelete = ref(false)

onMounted(() => {
  if (exerciseStore.exercises.length === 0) {
    exerciseStore.fetchExercises()
  }
  planStore.fetchPlansWithDetails()
})

function confirmDelete(id: number) {
  deleteId.value = id
  showDelete.value = true
}

async function handleDelete() {
  if (deleteId.value === null) return
  try {
    await planStore.deletePlan(deleteId.value)
    toast.success('План удалён')
  } catch {
    toast.error('Не удалось удалить план')
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 p-4 md:p-8">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-text-primary md:text-[32px]">Планы тренировок</h1>
      <div class="hidden md:block">
        <AppButton size="m" @click="router.push('/plans/new')">
          <Plus :size="16" />
          Создать план
        </AppButton>
      </div>
      <button
        class="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-bg md:hidden"
        @click="router.push('/plans/new')"
      >
        <Plus :size="18" />
      </button>
    </div>

    <div v-if="planStore.loading && planStore.plans.length === 0" class="py-12 text-center text-text-secondary">
      Загрузка...
    </div>
    <EmptyState
      v-else-if="planStore.plans.length === 0"
      title="Нет планов"
      description="Создайте план тренировок для систематичных занятий"
      action-text="Создать план"
      @action="router.push('/plans/new')"
    />
    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <PlanCard
        v-for="p in planStore.plans"
        :key="p.id"
        :plan="p"
        :detail="planStore.details[p.id]"
        @delete="confirmDelete"
      />
    </div>

    <ConfirmDialog
      v-model="showDelete"
      title="Удалить план?"
      message="Это действие нельзя отменить."
      confirm-text="Удалить"
      variant="danger"
      @confirm="handleDelete"
    />
  </div>
</template>
