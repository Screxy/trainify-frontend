<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import {
  ChartPie,
  ClipboardList,
  Dumbbell,
  LayoutDashboard,
  Menu,
  Plus,
  User,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const moreOpen = ref(false)

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}

const isMoreActive = computed(
  () => isActive('/analytics') || isActive('/profile'),
)

function toggleMore() {
  moreOpen.value = !moreOpen.value
}

function go(path: string) {
  moreOpen.value = false
  router.push(path)
}
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 items-center justify-items-center border-t border-border bg-bg-card pb-5 pt-2 md:hidden">
    <RouterLink
      to="/"
      class="flex flex-col items-center gap-1"
      :class="isActive('/') && !isActive('/workouts') && !isActive('/plans') && !isMoreActive
        ? 'text-accent font-semibold'
        : 'text-text-secondary'"
    >
      <LayoutDashboard :size="22" />
      <span class="text-[10px]">Главная</span>
    </RouterLink>

    <RouterLink
      to="/workouts"
      class="flex flex-col items-center gap-1"
      :class="isActive('/workouts') ? 'text-accent font-semibold' : 'text-text-secondary'"
    >
      <Dumbbell :size="22" />
      <span class="text-[10px]">Тренировки</span>
    </RouterLink>

    <RouterLink
      to="/workouts/new"
      class="flex h-12 w-12 items-center justify-center rounded-3xl bg-accent text-bg shadow-lg"
    >
      <Plus :size="24" />
    </RouterLink>

    <RouterLink
      to="/plans"
      class="flex flex-col items-center gap-1"
      :class="isActive('/plans') ? 'text-accent font-semibold' : 'text-text-secondary'"
    >
      <ClipboardList :size="22" />
      <span class="text-[10px]">Планы</span>
    </RouterLink>

    <button
      type="button"
      class="flex flex-col items-center gap-1"
      :class="isMoreActive || moreOpen ? 'text-accent font-semibold' : 'text-text-secondary'"
      @click="toggleMore"
    >
      <Menu :size="22" />
      <span class="text-[10px]">Ещё</span>
    </button>
  </nav>

  <!-- More menu overlay + popover -->
  <Teleport to="body">
    <Transition name="more-overlay">
      <div
        v-if="moreOpen"
        class="fixed inset-0 z-40 md:hidden"
        style="background-color: rgba(13, 17, 23, 0.8)"
        @click="moreOpen = false"
      />
    </Transition>
    <Transition name="more-menu">
      <div
        v-if="moreOpen"
        class="fixed bottom-[88px] right-4 z-50 w-[200px] overflow-hidden rounded-xl border border-border bg-bg-card py-2 shadow-2xl md:hidden"
      >
        <button
          type="button"
          class="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-bg-hover"
          @click="go('/analytics')"
        >
          <ChartPie :size="20" class="text-text-secondary" />
          <span class="text-sm text-text-primary">Аналитика</span>
        </button>
        <button
          type="button"
          class="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-bg-hover"
          @click="go('/profile')"
        >
          <User :size="20" class="text-text-secondary" />
          <span class="text-sm text-text-primary">Профиль</span>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.more-overlay-enter-active,
.more-overlay-leave-active {
  transition: opacity 0.15s ease;
}
.more-overlay-enter-from,
.more-overlay-leave-to {
  opacity: 0;
}

.more-menu-enter-active,
.more-menu-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.more-menu-enter-from,
.more-menu-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
