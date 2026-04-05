<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  icon: Component
  value: string | number
  label: string
  iconColor?: string
}

withDefaults(defineProps<Props>(), {
  iconColor: 'text-accent',
})
</script>

<template>
  <div class="flex flex-col gap-2 rounded-lg border border-border bg-bg-card p-4 md:p-5">
    <component :is="icon" :size="20" :class="iconColor" />
    <span class="text-2xl font-bold text-text-primary">{{ value }}</span>
    <span class="text-xs text-text-secondary">{{ label }}</span>
  </div>
</template>
