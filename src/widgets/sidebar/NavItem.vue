<script setup lang="ts">
import type { Component } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

interface Props {
  to: string
  icon: Component
  label: string
}

defineProps<Props>()

const route = useRoute()
</script>

<template>
  <RouterLink
    :to="to"
    class="flex h-10 items-center gap-3 rounded-lg px-4 text-sm font-medium transition-colors"
    :class="route.path === to || route.path.startsWith(to + '/')
      ? 'bg-accent/10 text-accent font-semibold'
      : 'text-text-secondary hover:bg-bg-hover'"
  >
    <component :is="icon" :size="20" />
    <span>{{ label }}</span>
  </RouterLink>
</template>
