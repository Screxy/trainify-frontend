<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAdminStore } from '@/features/admin'
import { SearchInput, AppSelect, AppBadge } from '@/shared/ui'

const adminStore = useAdminStore()
const search = ref('')
const roleFilter = ref('')

const roleOptions = [
  { value: '', label: 'Все роли' },
  { value: 'user', label: 'Пользователь' },
  { value: 'admin', label: 'Администратор' },
]

onMounted(() => {
  adminStore.fetchUsers()
})

const filtered = computed(() => {
  let list = adminStore.users
  if (roleFilter.value) list = list.filter((u) => u.role === roleFilter.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter((u) => u.email.toLowerCase().includes(q) || (u.name ?? '').toLowerCase().includes(q))
  }
  return list
})
</script>

<template>
  <div class="flex flex-col gap-6 p-4 md:p-8">
    <h1 class="text-xl font-bold text-text-primary md:text-[32px]">Пользователи</h1>

    <div class="flex flex-col gap-3 md:flex-row">
      <div class="flex-1"><SearchInput v-model="search" placeholder="Поиск по email или имени..." /></div>
      <div class="w-full md:w-40"><AppSelect v-model="roleFilter" :options="roleOptions" placeholder="Роль" /></div>
    </div>

    <div v-if="adminStore.loading" class="py-12 text-center text-text-secondary">Загрузка...</div>
    <div v-else class="overflow-x-auto rounded-lg border border-border">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-bg-card text-left text-xs text-text-secondary">
            <th class="px-5 py-3 font-medium">Email</th>
            <th class="px-5 py-3 font-medium">Имя</th>
            <th class="px-5 py-3 font-medium">Роль</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in filtered" :key="u.id" class="border-t border-border hover:bg-bg-hover transition-colors">
            <td class="px-5 py-3 text-text-primary">{{ u.email }}</td>
            <td class="px-5 py-3 text-text-primary">{{ u.name ?? '—' }}</td>
            <td class="px-5 py-3">
              <AppBadge :variant="u.role === 'admin' ? 'info' : 'default'">
                {{ u.role === 'admin' ? 'Админ' : 'Пользователь' }}
              </AppBadge>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="3" class="px-5 py-8 text-center text-text-secondary">Пользователи не найдены</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
