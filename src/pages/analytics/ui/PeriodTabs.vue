<script setup lang="ts">
interface Props {
  modelValue: 'week' | 'month' | 'year'
}

defineProps<Props>()
defineEmits<{ 'update:modelValue': [v: 'week' | 'month' | 'year'] }>()

const tabs: { value: 'week' | 'month' | 'year'; label: string }[] = [
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'year', label: 'Год' },
]
</script>

<template>
  <div class="flex gap-1 rounded-lg bg-bg-input p-1">
    <button
      v-for="t in tabs"
      :key="t.value"
      class="rounded-md px-4 py-1.5 text-sm font-medium transition-colors"
      :class="modelValue === t.value
        ? 'bg-accent text-bg'
        : 'text-text-secondary hover:text-text-primary'"
      @click="$emit('update:modelValue', t.value)"
    >
      {{ t.label }}
    </button>
  </div>
</template>
