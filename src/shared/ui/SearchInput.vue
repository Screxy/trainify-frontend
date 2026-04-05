<script setup lang="ts">
import { Search } from 'lucide-vue-next'

interface Props {
  modelValue: string
  placeholder?: string
}

withDefaults(defineProps<Props>(), {
  placeholder: 'Поиск...',
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="flex h-10 items-center gap-2 rounded-lg border border-border bg-bg-input px-3">
    <Search :size="18" class="shrink-0 text-text-secondary" />
    <input
      :value="modelValue"
      :placeholder="placeholder"
      class="w-full bg-transparent text-sm text-text-primary placeholder-text-secondary outline-none"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>
