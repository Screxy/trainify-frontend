<script setup lang="ts">
import { computed, ref } from 'vue'
import { Sparkles, Loader2, Timer } from 'lucide-vue-next'
import { useAiInsightsStore } from '@/features/analytics'
import { AppButton, AppInput, AppSelect } from '@/shared/ui'
import type { AIGoal } from '@/shared/types'

const store = useAiInsightsStore()

const goal = ref<string>('general')
const notes = ref('')

const goalOptions: { value: string; label: string }[] = [
  { value: 'general', label: 'Общая форма' },
  { value: 'strength', label: 'Сила' },
  { value: 'hypertrophy', label: 'Гипертрофия' },
  { value: 'endurance', label: 'Выносливость' },
  { value: 'weight_loss', label: 'Снижение веса' },
]

const isWorking = computed(
  () => store.status === 'submitting' || store.status === 'polling',
)

function dayPrefix(date: Date): string {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrowStart = new Date(todayStart.getTime() + 86400000)
  const dayAfterTomorrow = new Date(todayStart.getTime() + 86400000 * 2)
  if (date >= todayStart && date < tomorrowStart) return 'сегодня'
  if (date >= tomorrowStart && date < dayAfterTomorrow) return 'завтра'
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

function hourMinute(date: Date): string {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function relativeDuration(future: Date): string {
  const diffMs = future.getTime() - Date.now()
  if (diffMs <= 0) return 'скоро'
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 60) return `${minutes} мин`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}ч`
  const days = Math.round(hours / 24)
  return `${days} дн`
}

const nextAvailableLabel = computed(() => {
  if (!store.nextAvailableAt) return ''
  const d = new Date(store.nextAvailableAt)
  return `${dayPrefix(d)} в ${hourMinute(d)}`
})

const nextAvailableRelative = computed(() => {
  if (!store.nextAvailableAt) return ''
  return relativeDuration(new Date(store.nextAvailableAt))
})

const generatedLabel = computed(() => {
  const job = store.latest?.job
  const ts = job?.finished_at ?? job?.created_at
  if (!ts) return ''
  const d = new Date(ts)
  return `${dayPrefix(d)} в ${hourMinute(d)}`
})

async function submit() {
  await store.createInsight(goal.value as AIGoal, notes.value)
}
</script>

<template>
  <div class="flex flex-col gap-4 rounded-lg border border-accent-secondary/20 bg-bg-card p-6">
    <div class="flex items-center gap-2">
      <Sparkles :size="20" class="text-accent-secondary" />
      <h3 class="text-base font-semibold text-text-primary">AI-рекомендация</h3>
    </div>

    <!-- Working state -->
    <div v-if="isWorking" class="flex flex-col items-center gap-2 py-4 text-text-secondary">
      <Loader2 :size="24" class="animate-spin text-accent" />
      <span class="text-sm">Анализируем ваши тренировки…</span>
    </div>

    <!-- Result state -->
    <template v-else-if="store.currentResult">
      <p class="text-sm leading-relaxed text-text-secondary">
        {{ store.currentResult.summary }}
      </p>
      <ul v-if="store.currentResult.recommendations.length > 0" class="flex flex-col gap-2">
        <li
          v-for="(rec, i) in store.currentResult.recommendations"
          :key="i"
          class="rounded-lg border border-border bg-bg-input p-3"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-semibold uppercase tracking-wide text-text-secondary">
              {{ rec.area }}
            </span>
            <span
              class="text-[10px] font-semibold uppercase"
              :class="{
                'text-success': rec.severity === 'low',
                'text-warning': rec.severity === 'medium',
                'text-error': rec.severity === 'high',
              }"
            >
              {{ rec.severity }}
            </span>
          </div>
          <p class="mt-1 text-sm text-text-primary">{{ rec.advice }}</p>
        </li>
      </ul>
      <div v-if="generatedLabel" class="flex items-center gap-1.5 text-xs text-text-secondary">
        <Timer :size="14" />
        <span>
          Сгенерировано {{ generatedLabel }}<template v-if="!store.canCreate && nextAvailableRelative"> · следующая через {{ nextAvailableRelative }}</template>
        </span>
      </div>
      <AppButton v-if="store.canCreate" variant="primary" @click="submit">
        Новый запрос
      </AppButton>
      <AppButton v-else variant="secondary" disabled class="opacity-50">
        Доступно {{ nextAvailableLabel }}
      </AppButton>
    </template>

    <!-- Form (empty) -->
    <template v-else>
      <p class="text-sm leading-relaxed text-text-secondary">
        Выберите цель и получите персональный совет на основе ваших тренировок
        за последние 30 дней.
      </p>
      <AppSelect v-model="goal" label="Цель" :options="goalOptions" />
      <AppInput
        v-model="notes"
        label="Заметки (опционально)"
        placeholder="Например: хочу прогресс в жиме"
      />
      <AppButton
        v-if="store.canCreate"
        :loading="store.status === 'submitting'"
        @click="submit"
      >
        Получить рекомендацию
      </AppButton>
      <AppButton v-else variant="secondary" disabled class="opacity-50">
        Доступно {{ nextAvailableLabel }}
      </AppButton>
    </template>
  </div>
</template>
