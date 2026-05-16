<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ClipboardList, Dumbbell } from 'lucide-vue-next'
import { AppInput } from '@/shared/ui'

const router = useRouter()
const title = ref('')
const weightBefore = ref('')

function choosePlan() {
  const query: Record<string, string> = {}
  if (title.value) query.title = title.value
  if (weightBefore.value) query.weight = weightBefore.value
  router.push({ path: '/workouts/select-plan', query })
}

function chooseFree() {
  const query: Record<string, string> = {}
  if (title.value) query.title = title.value
  if (weightBefore.value) query.weight = weightBefore.value
  router.push({ path: '/workouts/setup', query })
}
</script>

<template>
  <div class="flex flex-col gap-4 p-5 md:p-8">
    <div class="flex flex-col gap-1">
      <h1 class="text-2xl font-bold text-text-primary">Начать тренировку</h1>
      <p class="text-[15px] text-text-secondary">Настройте и выберите тип тренировки</p>
    </div>

    <!-- Inputs -->
    <div class="flex flex-col gap-3">
      <AppInput v-model="title" label="Название тренировки" placeholder="Например: Push Day" />
      <AppInput v-model="weightBefore" label="Вес до тренировки (кг)" type="number" placeholder="Опционально" />
    </div>

    <!-- Plan card -->
    <div class="flex flex-col gap-3 rounded-2xl bg-bg-card p-4">
      <div class="flex h-10 w-10 items-center justify-center rounded-[10px] bg-accent/[0.13]">
        <ClipboardList :size="20" class="text-accent" />
      </div>
      <span class="text-base font-semibold text-text-primary">По плану</span>
      <p class="text-[13px] leading-relaxed text-text-secondary">
        Следуйте готовой программе тренировок с заданными упражнениями и подходами
      </p>
      <button
        class="flex h-9 w-full items-center justify-center rounded-lg bg-accent text-sm font-semibold text-bg"
        @click="choosePlan"
      >
        Выбрать план
      </button>
    </div>

    <!-- Free card -->
    <div class="flex flex-col gap-3 rounded-2xl bg-bg-card p-4">
      <div class="flex h-10 w-10 items-center justify-center rounded-[10px] bg-info/[0.13]">
        <Dumbbell :size="20" class="text-info" />
      </div>
      <span class="text-base font-semibold text-text-primary">Свободная тренировка</span>
      <p class="text-[13px] leading-relaxed text-text-secondary">
        Создайте тренировку на ходу — добавляйте упражнения из библиотеки по мере выполнения
      </p>
      <button
        class="flex h-9 w-full items-center justify-center rounded-lg border border-border text-sm font-medium text-text-primary hover:bg-bg-hover"
        @click="chooseFree"
      >
        Начать свободную
      </button>
    </div>
  </div>
</template>
