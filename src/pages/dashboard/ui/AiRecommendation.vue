<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'
</script>

<template>
  <div class="flex flex-col gap-3 rounded-lg border border-accent/20 bg-bg-card p-5">
    <div class="flex items-center gap-2">
      <Sparkles :size="18" class="text-accent" />
      <span class="text-sm font-semibold text-text-primary">AI-рекомендация</span>
    </div>
    <p class="text-sm leading-relaxed text-text-secondary">
      Судя по вашим последним тренировкам, рекомендуем увеличить объём на ноги.
      Попробуйте добавить 1-2 подхода в приседаниях на следующей тренировке.
    </p>
  </div>
</template>
