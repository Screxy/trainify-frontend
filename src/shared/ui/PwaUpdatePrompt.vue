<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { RefreshCw, X } from 'lucide-vue-next'

const { needRefresh, updateServiceWorker } = useRegisterSW({
  immediate: true,
})

function applyUpdate() {
  updateServiceWorker(true)
}

function dismiss() {
  needRefresh.value = false
}
</script>

<template>
  <Transition name="pwa-toast">
    <div
      v-if="needRefresh"
      class="fixed bottom-24 left-1/2 z-[60] flex w-[calc(100%-32px)] max-w-md -translate-x-1/2 items-center gap-3 rounded-xl border border-border bg-bg-card px-4 py-3 shadow-2xl md:bottom-6 md:left-auto md:right-6 md:translate-x-0"
    >
      <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15">
        <RefreshCw :size="18" class="text-accent" />
      </div>
      <div class="flex flex-1 flex-col gap-0.5">
        <span class="text-sm font-semibold text-text-primary">Доступно обновление</span>
        <span class="text-xs text-text-secondary">Перезагрузить, чтобы применить</span>
      </div>
      <button
        type="button"
        class="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-bg hover:bg-accent-hover"
        @click="applyUpdate"
      >
        Обновить
      </button>
      <button
        type="button"
        class="text-text-secondary transition-colors hover:text-text-primary"
        aria-label="Закрыть"
        @click="dismiss"
      >
        <X :size="18" />
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.pwa-toast-enter-active,
.pwa-toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.pwa-toast-enter-from,
.pwa-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 12px);
}
@media (min-width: 768px) {
  .pwa-toast-enter-from,
  .pwa-toast-leave-to {
    transform: translateY(12px);
  }
}
</style>
