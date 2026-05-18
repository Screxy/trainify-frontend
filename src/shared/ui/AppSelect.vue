<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Check, ChevronDown } from 'lucide-vue-next'

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
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: 'Выберите...',
  error: '',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const open = ref(false)
const rootRef = ref<HTMLDivElement | null>(null)

const selectedLabel = computed(
  () => props.options.find((o) => o.value === props.modelValue)?.label ?? '',
)

function toggle() {
  if (props.disabled) return
  open.value = !open.value
}

function select(value: string) {
  emit('update:modelValue', value)
  open.value = false
}

function onDocClick(e: MouseEvent) {
  if (!open.value) return
  const target = e.target as Node
  if (rootRef.value && !rootRef.value.contains(target)) {
    open.value = false
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', onDocClick)
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onDocClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="rootRef" class="relative flex flex-col gap-1.5">
    <label v-if="label" class="text-[13px] font-medium text-text-secondary">
      {{ label }}
    </label>
    <button
      type="button"
      :disabled="disabled"
      class="flex h-10 items-center justify-between gap-2 rounded-lg border bg-bg-input px-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      :class="[
        error ? 'border-error' : open ? 'border-accent' : 'border-border',
      ]"
      @click="toggle"
    >
      <span
        class="truncate text-sm"
        :class="selectedLabel ? 'text-text-primary' : 'text-text-secondary'"
      >
        {{ selectedLabel || placeholder }}
      </span>
      <ChevronDown
        :size="18"
        class="shrink-0 text-text-secondary transition-transform"
        :class="open && 'rotate-180'"
      />
    </button>

    <!-- Dropdown popover -->
    <Transition name="dropdown">
      <div
        v-if="open"
        class="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-lg border border-border bg-bg-card py-1 shadow-lg"
      >
        <button
          v-for="opt in options"
          :key="opt.value"
          type="button"
          class="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-bg-hover"
          :class="modelValue === opt.value ? 'text-accent' : 'text-text-primary'"
          @click="select(opt.value)"
        >
          <span class="truncate">{{ opt.label }}</span>
          <Check v-if="modelValue === opt.value" :size="14" class="shrink-0" />
        </button>
        <div
          v-if="options.length === 0"
          class="px-3 py-2 text-sm text-text-secondary"
        >
          Нет вариантов
        </div>
      </div>
    </Transition>

    <span v-if="error" class="text-xs text-error">{{ error }}</span>
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
