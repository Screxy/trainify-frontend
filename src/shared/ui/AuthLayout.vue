<script setup lang="ts">
import { Dumbbell } from 'lucide-vue-next'

interface Props {
  subtitle: string
  /** Top padding on mobile (px). Login=80, Register=60 */
  mobilePaddingTop?: number
}

const props = withDefaults(defineProps<Props>(), {
  mobilePaddingTop: 80,
})
</script>

<template>
  <div
    class="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_center,#1A2332,#0F1117)] px-6 py-10 md:px-4 md:py-0"
    :style="{ '--mobile-pt': `${props.mobilePaddingTop}px` }"
  >
    <!-- Desktop: card with bg/border. Mobile: no card, just content -->
    <div
      class="flex w-full max-w-[400px] flex-col gap-6
             md:rounded-2xl md:border md:border-[#2D3748] md:bg-[#1A1D27] md:p-10"
    >
      <!-- Logo -->
      <div class="flex flex-col items-center gap-2">
        <div class="flex items-center gap-2.5">
          <Dumbbell :size="32" class="text-[#22C55E]" />
          <span class="text-[28px] font-bold text-[#F1F5F9]">Trainify</span>
        </div>
        <p class="text-sm text-[#94A3B8]">{{ subtitle }}</p>
      </div>

      <slot />
    </div>
  </div>
</template>
