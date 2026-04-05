<script setup lang="ts">
import { BarChart3 } from 'lucide-vue-next'
</script>

<template>
  <div class="flex flex-col gap-4 rounded-lg border border-border bg-bg-card p-5">
    <h3 class="text-base font-semibold text-text-primary">Прогресс</h3>
    <div class="flex h-[200px] items-center justify-center">
      <div class="flex flex-col items-center gap-2 text-text-secondary">
        <BarChart3 :size="32" />
        <span class="text-sm">График доступен после нескольких тренировок</span>
      </div>
    </div>
  </div>
</template>
