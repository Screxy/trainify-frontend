<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

interface Option {
  value: string
  label: string
}

interface Props {
  label?: string
  modelValue: string
  options: Option[]
  placeholder?: string
  error?: string
}

withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: 'Выберите...',
  error: '',
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="text-[13px] font-medium text-text-secondary">
      {{ label }}
    </label>
    <div
      class="relative flex h-10 items-center rounded-lg border px-3"
      :class="error ? 'border-error bg-bg-input' : 'border-border bg-bg-input'"
    >
      <select
        :value="modelValue"
        class="w-full appearance-none bg-transparent pr-6 text-sm text-text-primary outline-none"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option value="" disabled class="bg-bg-input text-text-secondary">
          {{ placeholder }}
        </option>
        <option
          v-for="opt in options"
          :key="opt.value"
          :value="opt.value"
          class="bg-bg-input text-text-primary"
        >
          {{ opt.label }}
        </option>
      </select>
      <ChevronDown :size="16" class="pointer-events-none absolute right-3 text-text-secondary" />
    </div>
    <span v-if="error" class="text-xs text-error">{{ error }}</span>
  </div>
</template>
