<script setup lang="ts">
import { onMounted } from 'vue'
import { Check, X } from 'lucide-vue-next'
import { useAdminStore } from '@/features/admin'
import { AppButton, AppBadge, EmptyState } from '@/shared/ui'
import { useToast } from '@/shared/lib/useToast'

const adminStore = useAdminStore()
const toast = useToast()

onMounted(() => {
  adminStore.fetchPendingExercises()
})

async function approve(id: number) {
  try {
    await adminStore.approveExercise(id)
    toast.success('Упражнение одобрено')
  } catch {
    toast.error('Ошибка')
  }
}

async function reject(id: number) {
  try {
    await adminStore.rejectExercise(id)
    toast.info('Упражнение отклонено')
  } catch {
    toast.error('Ошибка')
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 p-4 md:p-8">
    <h1 class="text-xl font-bold text-text-primary md:text-[32px]">Модерация упражнений</h1>

    <div v-if="adminStore.loading" class="py-12 text-center text-text-secondary">Загрузка...</div>
    <EmptyState
      v-else-if="adminStore.pendingExercises.length === 0"
      title="Нет упражнений на модерации"
      description="Все упражнения проверены"
    />
    <div v-else class="flex flex-col gap-3">
      <div
        v-for="ex in adminStore.pendingExercises"
        :key="ex.id"
        class="flex items-center justify-between rounded-lg border border-border bg-bg-card p-5"
      >
        <div class="flex flex-col gap-1">
          <span class="font-medium text-text-primary">{{ ex.name }}</span>
          <div class="flex items-center gap-2">
            <AppBadge>{{ ex.type }}</AppBadge>
            <span class="text-xs text-text-secondary">{{ ex.muscle_groups.join(', ') }}</span>
          </div>
        </div>
        <div class="flex gap-2">
          <AppButton size="s" @click="approve(ex.id)">
            <Check :size="14" />
            Одобрить
          </AppButton>
          <AppButton size="s" variant="danger" @click="reject(ex.id)">
            <X :size="14" />
            Отклонить
          </AppButton>
        </div>
      </div>
    </div>
  </div>
</template>
