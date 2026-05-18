<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ClipboardList, Dumbbell, ArrowLeft, Loader2 } from 'lucide-vue-next'
import { AppModal, AppInput } from '@/shared/ui'
import { usePlanStore } from '@/entities/plan'
import { useActiveWorkoutStore } from '@/entities/workout'
import { useToast } from '@/shared/lib/useToast'

interface Props {
  modelValue: boolean
}

defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>()

const router = useRouter()
const planStore = usePlanStore()
const activeWorkoutStore = useActiveWorkoutStore()
const toast = useToast()

const step = ref<'choose' | 'plan-select'>('choose')
const loadingPlan = ref(false)
const weightBefore = ref('')
const title = ref('')
const notes = ref('')

onMounted(() => {
  planStore.fetchPlans()
})

function close() {
  step.value = 'choose'
  emit('update:modelValue', false)
}

function chooseFree() {
  const query: Record<string, string> = {}
  if (weightBefore.value) query.weight = weightBefore.value
  if (title.value) query.title = title.value
  if (notes.value) query.notes = notes.value
  close()
  router.push({ path: '/workouts/setup', query })
}

function choosePlan() {
  step.value = 'plan-select'
}

async function selectPlan(planId: number) {
  loadingPlan.value = true
  try {
    await planStore.fetchPlan(planId)
    if (!planStore.currentPlan) return

    await activeWorkoutStore.startFromPlan(
      planStore.currentPlan,
      weightBefore.value ? Number(weightBefore.value) : undefined,
      notes.value || undefined,
      title.value || undefined,
    )
    close()
    router.push('/workouts/active')
  } catch {
    toast.error('Не удалось начать тренировку')
  } finally {
    loadingPlan.value = false
  }
}
</script>

<template>
  <AppModal :model-value="modelValue" :title="step === 'choose' ? 'Новая тренировка' : 'Выберите план'" @update:model-value="$emit('update:modelValue', $event)">
    <!-- Step 1: Choose mode -->
    <div v-if="step === 'choose'" class="flex flex-col gap-3">
      <AppInput
        v-model="title"
        label="Название"
        placeholder="Например: Push Day"
      />
      <AppInput
        v-model="notes"
        label="Заметки"
        placeholder="Необязательно"
      />
      <AppInput
        v-model="weightBefore"
        label="Вес до тренировки (кг)"
        type="number"
        placeholder="Необязательно"
      />

      <button
        class="flex items-center gap-4 rounded-lg border border-border bg-bg-input p-4 text-left transition-colors hover:bg-bg-hover"
        @click="choosePlan"
      >
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
          <ClipboardList :size="20" class="text-accent" />
        </div>
        <div>
          <div class="text-sm font-semibold text-text-primary">По плану</div>
          <div class="text-xs text-text-secondary">Следуйте составленному плану тренировок</div>
        </div>
      </button>

      <button
        class="flex items-center gap-4 rounded-lg border border-border bg-bg-input p-4 text-left transition-colors hover:bg-bg-hover"
        @click="chooseFree"
      >
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-info/10">
          <Dumbbell :size="20" class="text-info" />
        </div>
        <div>
          <div class="text-sm font-semibold text-text-primary">Свободная тренировка</div>
          <div class="text-xs text-text-secondary">Выберите упражнения из библиотеки</div>
        </div>
      </button>
    </div>

    <!-- Step 2: Plan selection -->
    <div v-else class="flex flex-col gap-3">
      <button
        class="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
        @click="step = 'choose'"
      >
        <ArrowLeft :size="14" />
        Назад
      </button>

      <div v-if="planStore.loading" class="flex items-center justify-center py-8">
        <Loader2 :size="24" class="animate-spin text-text-secondary" />
      </div>

      <div v-else-if="planStore.plans.length === 0" class="py-6 text-center text-sm text-text-secondary">
        У вас нет планов. Создайте план в разделе «Планы».
      </div>

      <button
        v-for="plan in planStore.plans"
        :key="plan.id"
        :disabled="loadingPlan"
        class="flex flex-col gap-1 rounded-lg border border-border bg-bg-input p-4 text-left transition-colors hover:bg-bg-hover disabled:opacity-50"
        @click="selectPlan(plan.id)"
      >
        <span class="text-sm font-semibold text-text-primary">{{ plan.name }}</span>
        <span v-if="plan.description" class="text-xs text-text-secondary">{{ plan.description }}</span>
      </button>
    </div>
  </AppModal>
</template>
