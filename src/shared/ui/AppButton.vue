<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 's' | 'm' | 'l'
  loading?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'l',
  loading: false,
  disabled: false,
})
</script>

<template>
  <button
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center gap-2 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[
      {
        's': 'h-8 rounded-md px-3 text-sm',
        'm': 'h-10 rounded-lg px-5 text-sm',
        'l': 'h-12 rounded-[10px] px-6 text-base',
      }[size],
      {
        'primary': 'bg-[#22C55E] text-[#0F1117] hover:bg-[#16A34A]',
        'secondary': 'bg-transparent text-[#F1F5F9] border border-[#2D3748] hover:bg-[#2A2D3A]',
        'ghost': 'bg-transparent text-[#94A3B8] hover:bg-[#2A2D3A]',
        'danger': 'bg-[#EF4444] text-[#0F1117] hover:bg-[#DC2626]',
      }[variant],
    ]"
  >
    <svg
      v-if="loading"
      class="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    <slot />
  </button>
</template>
