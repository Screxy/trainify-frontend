<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import {
  LayoutDashboard,
  Flame,
  Plus,
  ClipboardList,
  User,
} from 'lucide-vue-next'

const route = useRoute()

function isActive(path: string) {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-border bg-bg-card pb-5 pt-2 md:hidden">
    <RouterLink
      to="/"
      class="flex flex-col items-center gap-0.5"
      :class="isActive('/') && !isActive('/workouts') && !isActive('/plans') && !isActive('/profile')
        ? 'text-accent'
        : 'text-text-secondary'"
    >
      <LayoutDashboard :size="22" />
      <span class="text-[10px] font-medium">Dashboard</span>
    </RouterLink>

    <RouterLink
      to="/workouts"
      class="flex flex-col items-center gap-0.5"
      :class="isActive('/workouts') ? 'text-accent' : 'text-text-secondary'"
    >
      <Flame :size="22" />
      <span class="text-[10px] font-medium">Тренировки</span>
    </RouterLink>

    <RouterLink
      to="/workouts/active"
      class="flex h-12 w-12 items-center justify-center rounded-3xl bg-accent text-bg shadow-lg"
    >
      <Plus :size="24" />
    </RouterLink>

    <RouterLink
      to="/plans"
      class="flex flex-col items-center gap-0.5"
      :class="isActive('/plans') ? 'text-accent' : 'text-text-secondary'"
    >
      <ClipboardList :size="22" />
      <span class="text-[10px] font-medium">Планы</span>
    </RouterLink>

    <RouterLink
      to="/profile"
      class="flex flex-col items-center gap-0.5"
      :class="isActive('/profile') ? 'text-accent' : 'text-text-secondary'"
    >
      <User :size="22" />
      <span class="text-[10px] font-medium">Профиль</span>
    </RouterLink>
  </nav>
</template>
