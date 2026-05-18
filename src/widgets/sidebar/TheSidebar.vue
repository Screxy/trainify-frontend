<script setup lang="ts">
import {
  Dumbbell,
  LayoutDashboard,
  Flame,
  ClipboardList,
  BookOpen,
  BarChart3,
  User,
  LogOut,
  Users,
  Shield,
  Activity,
} from 'lucide-vue-next'
import NavItem from './NavItem.vue'
import { useAuthStore } from '@/features/auth'

const authStore = useAuthStore()
</script>

<template>
  <aside class="sticky top-0 hidden h-screen w-60 flex-col border-r border-border bg-bg-card px-3 py-6 md:flex">
    <!-- Logo -->
    <div class="mb-6 flex items-center gap-2.5 px-4">
      <Dumbbell :size="24" class="text-accent" />
      <span class="text-xl font-bold text-text-primary">Trainify</span>
    </div>

    <div class="mb-2 h-px bg-border" />

    <!-- Main nav -->
    <nav class="flex flex-1 flex-col gap-1">
      <NavItem to="/" :icon="LayoutDashboard" label="Dashboard" />
      <NavItem to="/workouts" :icon="Flame" label="Тренировки" />
      <NavItem to="/plans" :icon="ClipboardList" label="Планы" />
      <NavItem to="/exercises" :icon="BookOpen" label="Библиотека" />
      <NavItem to="/analytics" :icon="BarChart3" label="Аналитика" />

      <!-- Admin section -->
      <template v-if="authStore.isAdmin">
        <div class="mt-4 mb-2 px-4 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
          Админ-панель
        </div>
        <NavItem to="/admin/users" :icon="Users" label="Пользователи" />
        <NavItem to="/admin/exercises" :icon="Shield" label="Модерация" />
        <NavItem to="/admin/stats" :icon="Activity" label="Статистика" />
      </template>

      <!-- Spacer -->
      <div class="flex-1" />

      <div class="h-px bg-border" />

      <NavItem to="/profile" :icon="User" label="Профиль" />
      <button
        class="flex h-10 items-center gap-3 rounded-lg px-4 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-hover"
        @click="authStore.logout()"
      >
        <LogOut :size="20" />
        <span>Выйти</span>
      </button>
    </nav>
  </aside>
</template>
