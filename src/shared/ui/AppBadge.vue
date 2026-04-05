<script setup lang="ts">
interface Props {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default'
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
})
</script>

<template>
  <span
    class="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold"
    :class="{
      'bg-accent text-bg': variant === 'success',
      'bg-warning text-bg': variant === 'warning',
      'bg-error text-bg': variant === 'error',
      'bg-info text-bg': variant === 'info',
      'bg-bg-hover text-text-secondary': variant === 'default',
    }"
  >
    <slot />
  </span>
</template>
