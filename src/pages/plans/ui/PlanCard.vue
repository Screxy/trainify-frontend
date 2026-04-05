<script setup lang="ts">
import { Trash2, Edit } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'
import type { WorkoutPlan } from '@/shared/types'

interface Props {
  plan: WorkoutPlan
}

defineProps<Props>()
defineEmits<{ delete: [id: number] }>()

function formatDate(d?: string) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="flex flex-col gap-3 rounded-lg border border-border bg-bg-card p-5">
    <div class="flex items-start justify-between">
      <div>
        <h3 class="font-semibold text-text-primary">{{ plan.name }}</h3>
        <p v-if="plan.description" class="mt-1 text-sm text-text-secondary">{{ plan.description }}</p>
      </div>
      <div class="flex gap-1">
        <RouterLink
          :to="`/plans/${plan.id}/edit`"
          class="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-hover"
        >
          <Edit :size="16" />
        </RouterLink>
        <button
          class="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-hover hover:text-error"
          @click="$emit('delete', plan.id)"
        >
          <Trash2 :size="16" />
        </button>
      </div>
    </div>
    <span v-if="plan.created_at" class="text-xs text-text-secondary">
      Создан {{ formatDate(plan.created_at) }}
    </span>
  </div>
</template>
