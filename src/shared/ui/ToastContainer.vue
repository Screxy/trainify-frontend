<script setup lang="ts">
import { toasts } from '@/shared/lib/useToast'
import AppToast from './AppToast.vue'
</script>

<template>
  <Teleport to="body">
    <div class="fixed right-4 top-4 z-[100] flex flex-col gap-2 max-md:left-4 max-md:right-4">
      <TransitionGroup name="toast">
        <AppToast
          v-for="toast in toasts"
          :key="toast.id"
          :variant="toast.variant"
          :message="toast.message"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-12px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
